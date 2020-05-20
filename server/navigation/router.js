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
          this.dataset[coord] = [];
        }
        if (prev !== null) {
          this.dataset[prev].push(coord);
          this.dataset[coord].push(prev);
        }
        prev = coord;
      }
    }
    console.log("[Router] Data loaded!");
  }

  get data() {
    return this.dataset;
  }
}

exports.Router = new Router();