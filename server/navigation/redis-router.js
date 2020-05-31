/*

Database structure:
    Keys: coords as string ("lat,long")
        - coord,crime: crime #
        - coord,adj: adj set

Accessing the redis shell from docker:
    docker exec -it safety-maps-redis sh
    redis-cli

Example node-redis access syntax

    that.client.get("34.0605077,-118.4355842,crime", function(err,reply) {
        console.log(reply);
        console.log(typeof(reply)) //string - need to parseFloat!!
    });
    that.client.smembers("34.0605077,-118.4355842,adj", function(err,reply) {
        console.log(reply); 
        console.log(typeof(reply)); //list
    });

*/

class RedisRouter {
    constructor() {
        this.client = require('../redis-client');
    }

    loadDataset(dataset) {
        var loadCount = 0;
        var dataLoad = Object.keys(dataset).length;
        for (var coord in dataset) {
            var crime_key = coord + ",crime";
            var adj_key = coord + ",adj";
            this.client.set(crime_key, dataset[coord]["crime"]);
            var that = this;
            //this.client.sadd([adj_key].concat(dataset[coord]["adj"]), function() {
            this.client.sadd(adj_key, dataset[coord]["adj"], function() {
                if (++loadCount == dataLoad) {
                    console.log("[Redis Router] Data Loaded into Redis Memory!"); 
            }});
        }
    }

    // getCrime(point) {
    //     return;
    // }

    // getAdjacent(point) {
    //     return;
    // }
}

exports.RedisRouter = new RedisRouter();
