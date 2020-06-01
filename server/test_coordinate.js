
const PI = 3.1415926535;
function deg2rad(deg) {
    return deg * PI / 180;
  }

// Assumes flat surface for small distances
// Gets coordinate a distance away
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

const express = require('express')
const app = express()

app.get('/coord/:start/:angle/:dist', function (req, res) {
    var c = req.params.start.split(",");
    var coord = [parseFloat(c[0]),parseFloat(c[1])];
    var angle = parseFloat(req.params.angle);
    var dist = parseFloat(req.params.dist);
    res.send(getCoordInDir(coord,angle,dist));
});

//Listen on port 5000
app.listen(5000, () => {
    console.log('[Coord Test] Server started!')
  });