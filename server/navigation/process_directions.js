/*

    Implementation of functions to parse generated routes,
    both from Mapbox and SafetyMaps Router. Will generate
    objects in the format:

    {
        success: true/false,
        coordinates: [
            [-118, 34],
            ...
        ],
        turn-by-turn-directions: [
            { label: "Instruction 1",
               distance: 195 },
            ...
        ]
    }

*/

function createReturn(success, coordinates, dirs, error=null) {
    return {
        "success": success,
        "coordinates": coordinates,
        "turn-by-turn-directions": dirs,
        "error": error
    }
}

function errorReturn(err) {
    return createReturn(false, null, null, error=err);
}

function extract_directions(steps) {
    var directions = [];
    for (var i = 0; i < steps.length; ++i) {
        var instr = steps[i].maneuver.instruction;
        var dist = steps[i].distance;
        directions.push({"label": instr, "distance": dist});
    }
    return directions;
}

var mapbox = function process_mapbox_object(data) {
    try {
        var route = data.routes[0];
        var coords = route.geometry.coordinates;
        var steps = route.legs[0].steps;
        return createReturn(true, coords, extract_directions(steps));
    } catch (error) {
        return errorReturn("Failed to process mapbox object");
    }
}


var safetymaps = async function process_safetymaps_object(data, access_token, res) {
    // current idea - use map matching for sake of turn by turn
    // https://docs.mapbox.com/api/navigation/
    try {
        if (typeof(data) === 'string' || data instanceof String) {
            res.json(errorReturn(data));
        } else {
            if (data.length > 99) {
                res.json(createReturn(true, data, [
                    {
                        "label": "Long routes not yet supported.",
                        "distance": 0,
                    }
                ]));
            }
            var coordStr = data[0][0] + ',' + data[0][1];
            var rad = 15;
            var radStr = "" + rad;
            for (var i = 1; i < data.length; ++i) {
                coordStr = coordStr + ';' + data[i][0] + ',' + data[i][1];
                radStr += ";" + rad;
            }
            var url = `https://api.mapbox.com/matching/v5/mapbox/walking/${coordStr}?access_token=${access_token}&steps=true&waypoints=0;${data.length-1}&tidy=true&radiuses=${radStr}`;
            
            var request = require('request');
            request(url, function (error, response, body) {
                try {
                    if (!error && response.statusCode == 200) {
                        if (response.err) {
                            res.json(errorReturn("Error in map matching API response"));
                            return;
                        }
                        var dirs = extract_directions(JSON.parse(body).matchings[0].legs[0].steps);
                        res.json(createReturn(true, data, dirs));
                    } else {
                        res.json(errorReturn("Error reaching map matching API"));
                    } 
                } catch (error) {
                    res.json(errorReturn("Unexpected error requesting map matching API"));
                }
            });

        }
    } catch (error) {
        console.log(error)
        res.json(errorReturn("Failed to process safetymaps object"));
    }
}

module.exports = {
    mapbox: mapbox,
    safetymaps: safetymaps
}