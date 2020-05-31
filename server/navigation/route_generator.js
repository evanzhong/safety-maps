const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const PriorityQueue = require("./priority_queue");
const request = require('request');
const process_dirs = require('./process_directions');

// process.argv[2] and [3] are the start and end coordinates, respectively
// process.send() to give response!

const PI = 3.1415926535;

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
        if (response === "No route") {
            const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${parseIntoMapboxFormat(coords[i])};${parseIntoMapboxFormat(coords[i+1])}?steps=true&geometries=geojson&access_token=${mapboxAccessToken}`;
            
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // console.log(process_dirs.mapbox(JSON.parse(body)).coordinates);
                    accumulatedResults.concat(process_dirs.mapbox(JSON.parse(body)).coordinates);
                } else {
                    console.log("Error in routing:", coords[i], "to", coords[i+1]);
                    process.send("No route");
                }
            })
        }
        else accumulatedResults = accumulatedResults.concat(response);
    }
    if (accumulatedResults.length === 0) process.send("No route");
    process.send(accumulatedResults);
}

async function generatePath(start, end, shouldHandleProcess = true) {
    /*
    For now, use strings for coordinates.
    Later, implement function to find closest matching coordinate in dataset,
    then use Mapbox api to direct from start to closest matching coordinate
    Implemented using A* (will optimize for crime data in the future)
    Algorithm described here: https://www.redblobgames.com/pathfinding/a-star/introduction.html
    */

    var pq = new PriorityQueue();

    pq.enqueue(start, 0.0);

    var came_from = {};
    var cost_so_far = {};

    cost_so_far[start] = 0.0;

    while(!pq.isEmpty()) {
        var current = pq.dequeue()["element"];

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
            return result;
        }

        //Process neighbors of current coord
        var neighbors = await getNeighbors(current);
        var i;
        for (i = 0; i < neighbors.length; ++i) {
            var neighbor = neighbors[i];
            var new_cost = cost_so_far[current] + heuristic(current, neighbor);
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

// A* heuristic function - will later be optimized using crime data
// For now, we just use Euclidean Distance in kilometers
function heuristic(coord1, coord2) {
    const earthRadiusKm = 6371.0;
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

