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

//const { PerformanceObserver, performance } = require('perf_hooks');

function createReturn(success, coordinates, dirs, error=null) {
    return JSON.stringify({
        "success": success,
        "coordinates": coordinates,
        "turn-by-turn-directions": dirs,
        "error": error
    })
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

function combine_dirs(res_list) {
    var combined = []
    for (var i = 0; i < res_list.length; ++i) {
        if (i !== res_list.length - 1) {
            if (res_list[i].length > 1) {
                res_list[i].pop()
            }
        }
        combined = combined.concat(res_list[i]);
    }
    return combined;
}

var safetymaps = function process_safetymaps_object(data, access_token, res) {
    // current idea - use map matching for sake of turn by turn
    // https://docs.mapbox.com/api/navigation/
    //console.log("Starting map matching process");
    //var t0 = performance.now();
    try {
        if (typeof(data) === 'string' || data instanceof String) {
            res.end(errorReturn(data));
            return;
        } else {
            //console.log("Request data has length", data.length);
            var request = require('request');
            const max_num = 99;
            const rad = 15;
            const failed_match_scale = max_num * 37.9079584;
            var result_count = Math.ceil(data.length / max_num);
            var load_count = 0;
            //console.log(result_count);
            var return_list = new Array(result_count);
            var reqStr = "";
            var radStr = "";

            function makeRequest(i, url) {
                //console.log("Starting request", i)
                //console.log(url);
                request(url, function (error, response, body) {
                    try {
                        if (!error && response.statusCode == 200) {
                            if (response.err) {
                                res.end(errorReturn("Error in map matching API response"));
                                return;
                            }
                            let json = JSON.parse(body);
                            if (json.code === "NoMatch")  {
                                return_list[i] = [{
                                    label: "Mapbox MapMatching API failed to match this segment of direction list",
                                    distance: failed_match_scale
                                }];
                            } else {
                                return_list[i] = extract_directions(JSON.parse(body).matchings[0].legs[0].steps);
                            }
                            //console.log("PROCESS OF INDEX " + i + " COMPLETED, LOAD COUNT " + load_count);
                            if (++load_count == result_count) {
                                res.end(createReturn(true, data, combine_dirs(return_list)));
                                //console.log("PERFORMANCE: " + (performance.now() - t0) + " milliseconds");
                                //console.log(combine_dirs(return_list));
                                return;
                            }
                        } else {
                            res.end(errorReturn("Error reaching map matching API"));
                            return;
                        } 
                    } catch (error) {
                        console.log(error)
                        res.end(errorReturn("Unexpected error requesting map matching API"));
                        return;
                    }
                });
            }

            var index = 0;
            for (var i = 0; i < data.length; ++i) {
                reqStr += data[i][0] + ',' + data[i][1] + ';';
                radStr += rad + ';';
                if ((i+1) % max_num === 0 || i === data.length - 1) {
                    // Trim hanging semicolon from both request and radius strings
                    let formattedReq = reqStr.substring(0, reqStr.length - 1);
                    let formattedRad = radStr.substring(0, radStr.length - 1);
                    let waypt = ((i+1)%max_num !== 0) ? (data.length%max_num) -1 : max_num-1;
                    var url = `https://api.mapbox.com/matching/v5/mapbox/walking/${formattedReq}?access_token=${access_token}&steps=true&waypoints=0;${waypt}&tidy=true&radiuses=${formattedRad}`;
                    makeRequest(index, url);
                    index++;
                    reqStr = "";
                    radStr = "";
                }
            }
        }
    } catch (error) {
        console.log(error)
        res.end(errorReturn("Failed to process safetymaps object"));
        return;
    }
}


var safetymaps_DEPRECATED = async function process_safetymaps_object(data, access_token, res) {
    console.log(data);
    // current idea - use map matching for sake of turn by turn
    // https://docs.mapbox.com/api/navigation/
    var t0 = performance.now();
    console.log("hi")
    try {
        if (typeof(data) === 'string' || data instanceof String) {
            res.end(errorReturn(data));
            return;
        } else {
            console.log("attempting to make request", data.length)
       //     console.log('hello');
            /*
            if (data.length > 99) {
                res.end(createReturn(true, data, [
                    {
                        "label": "Long routes not yet supported.",
                        "distance": 0,
                    }
                ]));
                return;

            }
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
            /*
            request(url, function (error, response, body) {
                try {
                    if (!error && response.statusCode == 200) {
                        if (response.err) {
                            res.end(errorReturn("Error in map matching API response"));
                            return;
                        }
                        var dirs = extract_directions(JSON.parse(body).matchings[0].legs[0].steps);
                        res.end(createReturn(true, data, dirs));
                        return;
                    } else {
                        res.end(errorReturn("Error reaching map matching API"));
                        return;
                    } 
                } catch (error) {
                    res.end(errorReturn("Unexpected error requesting map matching API"));
                    return;
                }
            });*/

            //index will be the element of the array that we are going to request coords up to
/*
            var end_index = 0;
            if (data.length > 99) {
                end_index = 98;
            } else {
                end_index = data.length-1;
            }

            //console.log('length')

            console.log('end_index');
            console.log(end_index);

            console.log('datalength');
            console.log(data.length);*/

            let max_num = 99;
            let datalength = data.length;
            let loop_times = Math.floor(datalength / max_num);
            let remainder = datalength % max_num;
            let index = 0;
            let remainder_start = loop_times * max_num;
            let rad = 15;

            let new_return_list = [];
            let filledradStr = "";

            
            for (let i = 0; i < loop_times; ++i) {
           //     console.log(index);
                let coordStr = data[index][0] + ',' + data[index][1];
                filledradStr = "" + rad;
                let final_index = (i+1)*max_num;
                index++;
                for (; index < final_index; ++index) {
                //    console.log(index);
                    coordStr = coordStr + ';' + data[index][0] + ',' + data[index][1];
                    filledradStr = filledradStr + ";" + rad;
                }
                new_return_list.push(`https://api.mapbox.com/matching/v5/mapbox/walking/${coordStr}?access_token=${access_token}&steps=true&waypoints=0;${max_num-1}&tidy=true&radiuses=${filledradStr}`);
            }

            let remainderradStr = ""; 
            var remaindercoordStr;
            for (; index < datalength; ++index) {
             //   console.log(index);
                if (index === remainder_start) {
                    remaindercoordStr = data[index][0] + ',' + data[index][1];
                    remainderradStr = "" + rad;
                }
                else {
                    remaindercoordStr = remaindercoordStr + ';' + data[index][0] + ',' + data[index][1];
                    remainderradStr = remainderradStr + ";" + rad;
                }
            }

            new_return_list.push(`https://api.mapbox.com/matching/v5/mapbox/walking/${remaindercoordStr}?access_token=${access_token}&steps=true&waypoints=0;${remainder-1}&tidy=true&radiuses=${remainderradStr}`);

           // console.log(new_return_list);
            var return_list = [];
            function makeRequest(input_list, return_list, index) {
                //let url = input_list[index];
                //console.log("url now" + url);
             //   console.log("entered");
                request(input_list[index], function (error, response, body) {
                    try {
                        if (!error && response.statusCode == 200) {
                            if (response.err) {
                                res.end(errorReturn("Error in map matching API response"));
                                return;
                            }
                            //console.log('hi');
                            //console.log(JSON.parse(body));
                            return_list.push(extract_directions(JSON.parse(body).matchings[0].legs[0].steps));
                            //console.log("length return list");
                            //console.log(return_list.length);
                            if (index === input_list.length - 1) {
                                let j = 0;
                                var combined_dirs = [];
                                for (; j < return_list.length; ++j) {
                                    if (j !== return_list.length - 1) {
                                       return_list[j].pop();
                                    }
                                    combined_dirs = combined_dirs.concat(return_list[j]);
                                }
                             //   console.log(combined_dirs);
                                res.end(createReturn(true, data, combined_dirs));
                                console.log("PERFORMANCE: " + (performance.now() - t0) + " milliseconds");
                                return;
                            }
                            else {
                                //console.log("recursion");
                                //console.log("newStart" + newStart);
                                //console.log("newEnd" + newEnd);
                                makeRequest(input_list, return_list, index+1);
                            }
                            //res.json(createReturn(true, data, dirs));
                        } else {
                            res.end(errorReturn("Error reaching map matching API"));
                            return;
                        } 
                    } catch (error) {
                        res.end(errorReturn("Unexpected error requesting map matching API"));
                        return;
                    }
                });
            }
            makeRequest(new_return_list, return_list, 0);
        }
    } catch (error) {
        console.log(error)
        res.end(errorReturn("Failed to process safetymaps object"));
        return;
    }
}

module.exports = {
    mapbox: mapbox,
    safetymaps: safetymaps
}