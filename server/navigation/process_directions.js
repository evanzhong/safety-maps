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

function parse_data(error, response, body) {
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
}

var safetymaps = async function process_safetymaps_object(data, access_token, res) {
    // current idea - use map matching for sake of turn by turn
    // https://docs.mapbox.com/api/navigation/
    try {
        if (typeof(data) === 'string' || data instanceof String) {
            res.json(errorReturn(data));
        } else {
            /*
            if (data.length > 99) {
                res.json(createReturn(true, data, [
                    {
                        "label": "Long routes not yet supported.",
                        "distance": 0,
                    }
                ]));
                return;
            }*/

            /*
            var coordStr = data[0][0] + ',' + data[0][1];
            var rad = 15;
            var radStr = "" + rad;
            for (var i = 1; i < data.length; ++i) {
                coordStr = coordStr + ';' + data[i][0] + ',' + data[i][1];
                radStr += ";" + rad;
            }
            var url = `https://api.mapbox.com/matching/v5/mapbox/walking/${coordStr}?access_token=${access_token}&steps=true&waypoints=0;${data.length-1}&tidy=true&radiuses=${radStr}`;
            */


            var request = require('request');

            //index will be the element of the array that we are going to request coords up to

            var end_index = 0;
            if (data.length > 50) {
                end_index = 49;
            } else {
                end_index = data.length-1;
            }

            //console.log('length')

            console.log('end_index');
            console.log(end_index);

            console.log('datalength');
            console.log(data.length);

            var return_list = [];
            function makeRequest(return_list, start_index, end_index) {
                var coordStr = data[start_index][0] + ',' + data[start_index][1];
                var rad = 15;
                var radStr = "" + rad;
                for (let i = start_index+1; i <= end_index; ++i) {
                    coordStr = coordStr + ';' + data[i][0] + ',' + data[i][1];
                    radStr = radStr + ";" + rad;
                }
                var url = `https://api.mapbox.com/matching/v5/mapbox/walking/${coordStr}?access_token=${access_token}&steps=true&waypoints=0;${end_index-start_index}&tidy=true&radiuses=${radStr}`;
                
                console.log('url now');
                console.log(url);
                request(url, function (error, response, body) {
                    //try {
                        /*
                        if (error) {
                            console.log('error');
                        }
                        if (response.statusCode == 200) {
                            console.log('200');
                        }*/
                        if (!error && response.statusCode == 200) {
                            if (response.err) {
                                res.json(errorReturn("Error in map matching API response"));
                                return;
                            }
                            console.log('hi');
                            console.log(JSON.parse(body));
                            var dirs = extract_directions(JSON.parse(body).matchings[0].legs[0].steps);
                            //console.log(type(dirs));
                            console.log(dirs);
                            return_list.push(dirs);
                            console.log("length return list");
                            console.log(return_list.length);
                            if (end_index === data.length - 1) {
                                let j = 0;
                                var combined_dirs = [];
                                for (; j < return_list.length; ++j) {
                                    if (j !== return_list.length - 1) {
                                       let x =return_list[j].pop();
                                       console.log(x);
                                    }
                                    combined_dirs = combined_dirs.concat(return_list[j]);
                                }
                                console.log(combined_dirs);
                                res.json(createReturn(true, data, combined_dirs));
                            }
                            else {
                                let newStart = end_index + 1;
                                let newEnd = end_index + 50;
                                if (data.length - 1 - end_index <= 50) {
                                    newEnd = data.length - 1;
                                }
                                console.log("recursion");
                                console.log("newStart" + newStart);
                                console.log("newEnd" + newEnd);
                                makeRequest(return_list, newStart, newEnd);
                            }
                            //res.json(createReturn(true, data, dirs));
                        } else {
                            res.json(errorReturn("Error reaching map matching API"));
                        } 
                    /*} catch (error) {
                        res.json(errorReturn("Unexpected error requesting map matching API"));
                    }*/
                });
            }
            makeRequest(return_list, 0, end_index);
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