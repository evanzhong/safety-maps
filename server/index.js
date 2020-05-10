const express = require('express')
var request = require('request');
const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
 
app.get('/', function (req, res) {
  res.send('Hello World')
})

//Example API Call: (route from [-122.1230542,37.4322595] to [-122.15,37.45])
// localhost:8000/api/directions/-122.1230542,37.4322595/-122.15,37.45?access_token=...
app.get('/api/directions/:start/:end', function (req, res) {
  var url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + req.params.start + ';' + req.params.end + 
    '?steps=true&geometries=geojson&access_token=' + req.query.access_token;
  request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    res.json(JSON.parse(body));
  } else {
    return res.status(500).json({ type: 'error', message: err.message });
  }
})
})
 
app.listen(8000)