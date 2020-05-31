//const PriorityQueue = require("./priority_queue");
const fork = require('child_process').fork;
var kdTreeJS = require("kd-tree-javascript");
var process_dirs = require("./process_directions");

const PI = 3.1415926535;

function deg2rad(deg) {
  return deg * PI / 180;
}

// function switchOrder(str) {
//   var tmp = str.split(",");
//   return tmp[1] + "," + tmp[0];
// }

// function parseIntoMapboxFormat(str) {
//   var tmp = str.split(",");
//   return [parseFloat(tmp[1]), parseFloat(tmp[0])];
// }

// Assumes flat surface for small distances
// Gets coordinate a specified distance away, given bearing angle
function getCoordInDir(coord, angle, dist) {
  const R = 6371.0; //earth radius in km
  angle = deg2rad(angle);
  var lat1 = deg2rad(coord[0]);
  var long1 = deg2rad(coord[1]);

  var lat = Math.asin( Math.sin(lat1)*Math.cos(dist/R) +
                      Math.cos(lat1)*Math.sin(dist/R)*Math.cos(angle) );
  var long = long1 + Math.atan2(Math.sin(angle)*Math.sin(dist/R)*Math.cos(lat1),
                           Math.cos(dist/R)-Math.sin(lat1)*Math.sin(lat));

  lat = 180/PI*lat;
  long = 180/PI*long;

  long = (long+540)%360-180;
  console.log("getCoordInDir( \"" + coord[0]+","+coord[1]+"\" , " + angle + " , " + dist + " )");
  console.log(lat + " , " + long);
  return [lat,long];
}

function kdDistance(a, b) {
  const earthRadiusKm = 6371.0;

  var lat1r = deg2rad(a.lat);
  var lon1r = deg2rad(a.long);
  var lat2r = deg2rad(b.lat);
  var lon2r = deg2rad(b.long);

  var u = Math.sin((lat2r - lat1r) / 2);
  var v = Math.sin((lon2r - lon1r) / 2);

  return 2.0 * earthRadiusKm * Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v));
}



class Router {
  constructor() {
    this.dataset = {}; // keys: coords, values: list of adjacent coords
    this.redis = require("./redis-router").RedisRouter;
  }

  loadData(data) {
    var kdPoints = [];
    var i, j;
    for (i = 0; i < data.length; ++i) {
      var coords = data[i]["coords"];
      var prev = null;
      for (j = 0; j < coords.length; ++j) {
        kdPoints.push({lat: coords[j][0], long: coords[j][1]});
        var coord = coords[j].toString(); //keys are forced to be strings, may as well make everything a string 
        if (!(coord in this.dataset)) {
          this.dataset[coord] = {
            "crime": data[i]["dist_from_crime_all_vals"][j],
            "adj": []
          };
        }
        if (prev !== null) {
          this.dataset[prev]["adj"].push(coord);
          this.dataset[coord]["adj"].push(prev);
        }
        prev = coord;
      }
    }
    this.kdTree = new kdTreeJS.kdTree(kdPoints, kdDistance, ["lat", "long"]);
    console.log("[Router] Data processed!");
    this.redis.loadDataset(this.dataset);
  }

  generatePath(start, end, res, token) {
    /*
      For now, use strings for coordinates.
      Later, implement function to find closest matching coordinate in dataset,
      then use Mapbox api to direct from start to closest matching coordinate
      Implemented using A* (will optimize for crime data in the future)
      Algorithm described here: https://www.redblobgames.com/pathfinding/a-star/introduction.html
    */
    var start_split = start.split(",");
    var end_split = end.split(",");
    var start_kd = [parseFloat(start_split[0]), parseFloat(start_split[1])];
    var end_kd = [parseFloat(end_split[0]), parseFloat(end_split[1])];
    var start_kd_obj = this.closestValidCoord(start_kd)[0];
    var end_kd_obj = this.closestValidCoord(end_kd)[0];
    
    /*if (!(start in this.dataset && end in this.dataset)) {
      return "Bad coord";
    }*/
    var maxDistanceMatch = 0.1; //km
    if (!(start_kd_obj[1]< maxDistanceMatch && end_kd_obj[1] < maxDistanceMatch)) {
      this.processOutput("Bad coord", res, token);
      return "Bad coord";
    }

    start = start_kd_obj[0]["lat"] + "," + start_kd_obj[0]["long"];
    end = end_kd_obj[0]["lat"] + "," + end_kd_obj[0]["long"];

    if (start === end) {
      this.processOutput("Bad coord", res, token);
      return "Bad coord";
    }

    //console.log('spawning fork');
    var child = fork("navigation/route_generator.js", [start, end]);
    child.on('message', message => {
      // console.log("CHILD RESULT");
      // console.log(message);
      this.processOutput(message, res, token);
    });

    // var pq = new PriorityQueue();

    // pq.enqueue(start, 0.0);

    // var came_from = {};
    // var cost_so_far = {};

    // cost_so_far[start] = 0.0;

    // while(!pq.isEmpty()) {
    //   var current = pq.dequeue()["element"];
    //   //console.log(current);

    //   //If reached end coord
    //   if (current === end) {
    //     //Semi colon-separated string (for Mapbox Map Matching API)
    //     // (https://docs.mapbox.com/api/navigation/#map-matching)
    //     // Max 100 coordinates per request - if more, need to split into batches
        
    //     var result = []
    //     while (current != start) {
    //       result.unshift(parseIntoMapboxFormat(current));
    //       current = came_from[current];
    //     }
    //     result.unshift(parseIntoMapboxFormat(start));
    //     console.log("OFFICIAL RESULT");
    //     console.log(result);
    //     return result;
        
    //     /*var result = [];
    //     var result_str = "";
    //     var count = 1;
    //     while (current !== start) {
    //       if (count < 98) {
    //         result_str = ";" + switchOrder(current) + result_str;
    //         ++count;
    //       } else {
    //         result_str = switchOrder(current) + result_str;
    //         result.unshift(result_str);
    //         count = 1;
    //         result_str = "";
    //       }
    //       current = came_from[current];
    //     }
    //     result_str = switchOrder(start) + result_str;
    //     result.unshift(result_str);
    //     return result;*/
    //   }

    //   //Process neighbors of current coord
    //   var neighbors = this.dataset[current]["adj"];
    //   var i;
    //   for (i = 0; i < neighbors.length; ++i) {
    //     var neighbor = neighbors[i];
    //     var new_cost = cost_so_far[current] + this.heuristic(current, neighbor);
    //     if ((!(neighbor in cost_so_far)) || new_cost < cost_so_far[neighbor]) {
    //       cost_so_far[neighbor] = new_cost;
    //       pq.enqueue(neighbor, new_cost + this.heuristic(neighbor, end));
    //       came_from[neighbor] = current;
    //     }
    //   }
    // }

    // return "No route";
  }

  getNearbyCoordinate(start_arr, dist) {
    // var start_split = start.split(",");
    // var start_arr = [parseFloat(start_split[0]), parseFloat(start_split[1])];
    var start_kd_obj = this.closestValidCoord(start_arr)[0];
    if (start_kd_obj[1]< dist) {
      return start_kd_obj[0]["lat"] + "," + start_kd_obj[0]["long"];
    } else {
      return start_arr[0] + "," + start_arr[1];
    }
  }

  // accepts distances in kilometers
  generateCircularPath(start, dist, res, token){
    if (dist > 16.1) {
      this.processOutput("Error: only supports distances within 10 miles for now")
    }
    var maxDistanceMatch = 0.1; //km
    // var start_split = start.split(",");
    // var start_arr = [parseFloat(start_split[0]), parseFloat(start_split[1])];
    // var start_kd_obj = this.closestValidCoord(start_arr)[0];
    // if (start_kd_obj[1]< maxDistanceMatch) {
    //   // if we matched a point in our database, set start to that
    //   start = start_kd_obj[0]["lat"] + "," + start_kd_obj[0]["long"];
    //   start_arr = [parseFloat(start_kd_obj[0]["lat"]), parseFloat(start_kd_obj[0]["long"])];
    // }

    var start_arr = start.split(",");
    var start_arr = [parseFloat(start_arr[0]),parseFloat(start_arr[1])];
    start = this.getNearbyCoordinate(start_arr, maxDistanceMatch);
    start_arr = start.split(",");
    start_arr = [parseFloat(start_arr[0]),parseFloat(start_arr[1])];
    //Choose random angle to go in
    var angle1 = Math.floor(Math.random() * 360)
    if (Math.random() > 0.5) {
      var angle2 = (angle1 + 300) % 360;
    } else {
      var angle2 = (angle1 + 60) % 360;
    }
    var pt2 = getCoordInDir(start_arr, angle1, dist/4.0);
    pt2 = this.getNearbyCoordinate(pt2, maxDistanceMatch);

    var pt3 = getCoordInDir(start_arr, angle2, dist/4.0);
    pt3 = this.getNearbyCoordinate(pt3, maxDistanceMatch);

    //console.log('spawning fork');
    var child = fork("navigation/route_generator.js", [token, start, pt2[0]+","+pt2[1], pt3[0]+","+pt3[1], start]);
    child.on('message', message => {
      this.processOutput(message, res, token);
    });
    // console.log(start);
    // console.log(pt2);
    // console.log(pt3);
    // res.send("worked");
  }

  // A* heuristic function - will later be optimized using crime data
  // For now, we just use Euclidean Distance in kilometers
  // heuristic(coord1, coord2) {
  //   const earthRadiusKm = 6371.0;
  //   var coord1split = coord1.split(",");
  //   var coord2split = coord2.split(",");
  //   var c1lat = parseFloat(coord1split[0]);
  //   var c1long = parseFloat(coord1split[1]);
  //   var c2lat = parseFloat(coord2split[0]);
  //   var c2long = parseFloat(coord2split[1]);

  //   var lat1r = deg2rad(c1lat);
  //   var lon1r = deg2rad(c1long);
  //   var lat2r = deg2rad(c2lat);
  //   var lon2r = deg2rad(c2long);

  //   var u = Math.sin((lat2r - lat1r) / 2);
  //   var v = Math.sin((lon2r - lon1r) / 2);

  //   return 2.0 * earthRadiusKm * Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v));
  // }

  closestValidCoord(coord) {
    var formatted = {lat: coord[0], long: coord[1]}
    var nearest = this.kdTree.nearest(formatted, 1);
    return nearest;
  }

  get data() {
    return this.dataset;
  }

  processOutput(data, res, token) {
    process_dirs.safetymaps(data, token, res);
  }
}

exports.Router = new Router();