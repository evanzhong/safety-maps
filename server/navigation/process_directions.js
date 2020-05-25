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

var mapbox = function process_mapbox_object(data) {
    try {
        var route = data.routes[0];
        var coords = route.geometry.coordinates;
        var directions = [];
        var steps = route.legs[0].steps;
        var i;
        for (i = 0; i < steps.length; ++i) {
            /*var instructionArr = steps[i].bannerInstructions;
            // For info on banner instructions, see
            // https://docs.mapbox.com/api/navigation/#banner-instruction-object
            //Ignore secondary banner instructions per step for now (probably not needed)
            var text = instructionArr[0].primary.text;
            var modifier = instructionArr[0].primary.modifier;
            var dist = instructionArr.distance;
            var prefix = "";
            var suffix = ".";
            if (modifier === "uturn") {
                prefix = "U-Turn on ";
            } else if (modifier === "sharp right") {
                prefix = "Sharp right on ";
            } else if (modifier === "right") {
                prefix = "Make a right turn on ";
            } else if (modifier === "slight right") {
                prefix = "Slight right on ";
            } else if (modifier === "straight") {
                prefix = "Continue straight on ";
            } else if (modifier === "slight left") {
                prefix = "Slight left on ";
            } else if (modifier === "left") {
                prefix = "Continue left on ";
            } else if (modifier === "sharp left") {
                prefix = "Sharp left on ";
            }
            var instr = prefix + text + suffix;
            directions.push({"label": instr, "distance": dist});*/

            var instr = steps[i].maneuver.instruction;
            var dist = steps[i].distance;
            directions.push({"label": instr, "distance": dist});
        }
        return {
            "success": true,
            "coordinates": coords,
            "turn-by-turn-directions": directions
        };
    } catch (error) {
        return {
            "success": false,
            "coordinates": null,
            "turn-by-turn-directions": null
        }
    }
}


var safetymaps = function process_safetymaps_object(data) {
    // current idea - use map matching for sake of turn by turn
    // https://docs.mapbox.com/api/navigation/
    if (typeof(data) === 'string' || data instanceof String) {
        return {
            "success": false,
            "coordinates": null,
            "turn-by-turn-directions": null
        }
    } else {
        return {
            "success": true,
            "coordinates": data,
            "turn-by-turn-directions": [
                {
                    "label": "Directions not implemented yet",
                    "distance": 0,
                }
            ]
        }
    }
}

module.exports = {
    mapbox: mapbox,
    safetymaps: safetymaps
}