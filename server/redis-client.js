const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

client.on('connect', function() {
    console.log("[Redis] Connected!")
});

module.exports = client;
