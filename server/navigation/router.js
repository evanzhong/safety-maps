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

  generatePath(coord1, coord2) {
    /*
      For now, use strings for coordinates.
      Later, implement function to find closest matching coordinate in dataset,
      then use Mapbox api to direct from start to closest matching coordinate
      Implemented using A* (will optimize for crime data in the future)
    */
    return coord1;

  }

  // A* heuristic function - will later be optimized using crime data
  // For now, we just use Euclidean Distance in kilometers
  heuristic(coord1, coord2) {
    const earthRadiusKm = 6371.0;
    coord1split = coord1.split(" ");
    coord2split = coord2.split(" ");
    c1lat = parseFloat(coord1split[0]);
    c1long = parseFloat(coord1split[1]);
    c2lat = parseFloat(coord2split[0]);
    c2long = parseFloat(coord2split[1]);

    lat1r = deg2rad(c1lat);
    lon1r = deg2rad(c1long);
    lat2r = deg2rad(c2lat);
    lon2r = deg2rad(c2long);

    var u = Math.sin((lat2r - lat1r) / 2);
    var v = Math.sin((lon2r - lon1r) / 2);

    return 2.0 * earthRadiusKm * Math.asin(Math.sqrt(u * u + Math.cos(lat1r) * Math.cos(lat2r) * v * v));
  }

  get data() {
    return this.dataset;
  }
}

exports.Router = new Router();