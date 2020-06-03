const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const PriorityQueue = require("./priority_queue");
const request = require('request');
//const { PerformanceObserver, performance } = require('perf_hooks');

// process.argv[2] and [3] are the start and end coordinates, respectively
// process.send() to give response!

const PI = 3.1415926535;
const earthRadiusKm = 6371.0;

function deg2rad(deg) {
    return deg * PI / 180;
}

function parseIntoMapboxFormat(str) {
    var tmp = str.split(",");
    return [parseFloat(tmp[1]), parseFloat(tmp[0])];
}

client.on('connect', function(){
    // If 4 args passed, then route for regular travel mode
    if (process.argv.length === 4) {
        generatePath(process.argv[2], process.argv[3]);
        return;
    }

    const coords = [];
    // Igore the first 3 entires of process.argv, which are node, route_generator.js, and access_token
    for (let i = 3; i < process.argv.length; i++) {
        coords.push(process.argv[i]);
    }

    generatePathMultPoints(coords, process.argv[2]); //process.argv[2] holds the access token
});

async function generatePathMultPoints(coords, mapboxAccessToken){
    let accumulatedResults = [];
    for (let i = 0; i < coords.length - 1; i++) {
        const response = await generatePath(coords[i], coords[i+1], false);
        if (response === "No route") { // If SafetyMaps router cannot generate a route, fall back to mapbox api
            const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${parseIntoMapboxFormat(coords[i])};${parseIntoMapboxFormat(coords[i+1])}?steps=true&geometries=geojson&access_token=${mapboxAccessToken}`;
            
            let hasMapboxError = false;
            await new Promise((resolve, reject) => { //Wraping in a promise to preserve ordering
                request(url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        accumulatedResults = accumulatedResults.concat(JSON.parse(body).routes[0].geometry.coordinates);
                        resolve();
                    } else {
                        console.log("Error in routing:", coords[i], "to", coords[i+1]);
                        hasMapboxError = true;
                        reject();
                    }
                })
            })
            if (hasMapboxError) {
                process.send("No route");
                return;
            }
        }
        else accumulatedResults = accumulatedResults.concat(response);
    }

    if (accumulatedResults.length === 0) {
        process.send("No route")
    }
    else process.send(accumulatedResults);
}

async function generatePath(start, end, shouldHandleProcess = true) {
    /*
    For now, use strings for coordinates.
    Find closest matching coordinate in dataset,
    then use Mapbox api to direct from start to closest matching coordinate
    Implemented using A*, optimized for crime data
    Algorithm described here: https://www.redblobgames.com/pathfinding/a-star/introduction.html
    */

    //var t0 = performance.now();
    var pq = new PriorityQueue();

    pq.enqueue(start, 0.0);
    var closed_set = new Set();
    var came_from = {};
    var cost_so_far = {};

    cost_so_far[start] = 0.0;

    while(!pq.isEmpty()) {
        var current = pq.dequeue()["element"];
        if (closed_set.has(current)) {
            continue;
        }
        closed_set.add(current);
        //If reached end coord
        if (current === end) {
            //Semi colon-separated string (for Mapbox Map Matching API)
            // (https://docs.mapbox.com/api/navigation/#map-matching)
            // Max 100 coordinates per request - if more, need to split into batches
            var result = []
            while (current != start) {
                result.unshift(parseIntoMapboxFormat(current));
                current = came_from[current];
            }
            result.unshift(parseIntoMapboxFormat(start));
            if (shouldHandleProcess) process.send(result);
            //console.log("PERFORMANCE: " + (performance.now() - t0) + " milliseconds");
            return result;
        }

        //Process neighbors of current coord
        var neighborsAndCrime = await getCrimeAndNeighbors(current);
        var crime = neighborsAndCrime[0];
        var neighbors = neighborsAndCrime[1];
        var i;
        for (i = 0; i < neighbors.length; ++i) {
            var neighbor = neighbors[i];
            var new_cost = cost_so_far[current] + g(current, neighbor, crime);
            if ((!(neighbor in cost_so_far)) || new_cost < cost_so_far[neighbor]) {
                cost_so_far[neighbor] = new_cost;
                pq.enqueue(neighbor, new_cost + heuristic(neighbor, end));
                came_from[neighbor] = current;
            }
        }
    }
    if (shouldHandleProcess) process.send("No route");
    return "No route";
}

function heuristic(coord1, end) {
    return 4 * distanceKm(coord1, end);
}

function g(coord1, coord2, crime) {
    //1 is least crime, 0 is most crime
    // Factor in crime coefficient as 20% weighting in cost function
    return distanceKm(coord1, coord2) * (0.8 + 0.2*(1-crime));
}

// A* heuristic function - will later be optimized using crime data
// For now, we just use Euclidean Distance in kilometers
function distanceKm(coord1, coord2) {
    var coord1split = coord1.split(",");
    var coord2split = coord2.split(",");
    var c1lat = parseFloat(coord1split[0]);
    var c1long = parseFloat(coord1split[1]);
    var c2lat = parseFloat(coord2split[0]);
    var c2long = parseFloat(coord2split[1]);

    var lat1r = deg2rad(c1lat);
    var lon1r = deg2rad(c1long);
    var lat2r = deg2rad(c2lat);
    var lon2r = deg2rad(c2long);

    var u = Math.sin((lat2r - lat1r) / 2);
    var v = Math.sin((lon2r - lon1r) / 2);

    return 2.0 * earthRadiusKm * Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v));
}

/*
function getNeighbors(point) {
    return new Promise((resolve, reject) => {
        client.smembers(point + ",adj", function(err,reply) {
            if (err) {
                reject(err);
            } else {
                resolve(reply);
            }
        });
    });
}
*/

function getCrimeAndNeighbors(point) {
    return new Promise((resolve, reject) => {
        var receivedResponse = false;
        var crime;
        var adj;
        client.smembers(point + ",adj", function(err,reply) {
            if (err) {
                console.log(err);
                reply = [];
            }
            adj = reply;
            if (receivedResponse) {
                resolve([crime,adj]);
            } else {
                receivedResponse = true;
            }
        });
        client.get(point + ",crime", function(err,reply) {
            if (err) {
                console.log(err);
                reply = "0.5";
            }
            crime = parseFloat(reply);
            if (receivedResponse) {
                resolve([crime,adj]);
            } else {
                receivedResponse = true;
            }
        });
    })
}

