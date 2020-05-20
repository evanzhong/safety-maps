const PriorityQueue = require("./priority_queue");

const PI = 3.1415926535;

function deg2rad(deg) {
  return deg * PI / 180;
}

class Router {
  constructor() {
    this.dataset = {}; // keys: coords, values: list of adjacent coords
  }

  loadData(data) {
    var i, j;
    for (i = 0; i < data.length; ++i) {
      var coords = data[i]["coords"];
      var prev = null;
      for (j = 0; j < coords.length; ++j) {
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
    console.log("[Router] Data loaded!");
  }

  generatePath(start, end) {
    /*
      For now, use strings for coordinates.
      Later, implement function to find closest matching coordinate in dataset,
      then use Mapbox api to direct from start to closest matching coordinate
      Implemented using A* (will optimize for crime data in the future)
      Algorithm described here: https://www.redblobgames.com/pathfinding/a-star/introduction.html
    */
    
    if (!(start in this.dataset && end in this.dataset)) {
      return "Bad coord";
    }

    var pq = new PriorityQueue();

    pq.enqueue(start, 0.0);

    var came_from = {};
    var cost_so_far = {};

    cost_so_far[start] = 0.0;

    while(!pq.isEmpty()) {
      var current = pq.dequeue()["element"];
      console.log(current);

      //If reached end coord
      if (current === end) {
        var result = []
        while (current !== start) {
          result.unshift(current)
          current = came_from[current];
        }
        result.unshift(start);
        return {
          "Route Found" : result
        };
      }

      //Process neighbors of current coord
      var neighbors = this.dataset[current]["adj"];
      var i;
      for (i = 0; i < neighbors.length; ++i) {
        var neighbor = neighbors[i];
        var new_cost = cost_so_far[current] + this.heuristic(current, neighbor);
        if ((!(neighbor in cost_so_far)) || new_cost < cost_so_far[neighbor]) {
          cost_so_far[neighbor] = new_cost;
          pq.enqueue(neighbor, new_cost + this.heuristic(neighbor, end));
          came_from[neighbor] = current;
        }
      }
    }

    return "No route";
  }

  // A* heuristic function - will later be optimized using crime data
  // For now, we just use Euclidean Distance in kilometers
  heuristic(coord1, coord2) {
    const earthRadiusKm = 6371.0;
    var coord1split = coord1.split(" ");
    var coord2split = coord2.split(" ");
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

  get data() {
    return this.dataset;
  }
}

exports.Router = new Router();