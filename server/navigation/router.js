class Router {
  constructor() {
    this.dataset = {};
  }

  loadData(data) {
    this.dataset = data;
    console.log("[Router] Data loaded!");
  }

  get data() {
    return this.dataset;
  }
}

exports.Router = new Router();