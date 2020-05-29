var redis = require('redis');
var client = redis.createClient(); //default - hosts on localhost:6379

client.on('connect', function() {
    console.log("[Redis] connected")
});

