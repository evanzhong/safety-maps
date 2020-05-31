import React, { Component } from 'react';
import './Map.css';
import mapboxgl from 'mapbox-gl';

import DirectionSidebar from './DirectionSidebar';
import ProfileSidebar from './ProfileSidebar';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //on load, fix map to bay area (for now - until location services set up)
      map: null,
      lng: -118.4473698,
      lat: 34.0689254,
      zoom: 13,
      direction_list: null,
    };
    //For testing purposes - delete later
    window.map = this;
    this.renderRoute = this.renderRoute.bind(this);
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });
    this.setState({map: map});
  }

  //Labels a point on the map at the specified coords
  labelPoint(identifier, coords) {
    const map = this.state.map;
    if (map.getLayer(identifier)) {
      var data =  {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: coords
          }
        }]
      };
      map.getSource(identifier).setData(data);
    } else {
      map.addLayer({
        id: identifier,
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: coords
              }
            }]
          }
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#f30'
        }
      });
    }
  }

  // render route using call to directions API
  // For testing purposes: try in Chrome console:
  // map.renderRoute([-122.1230542,37.4322595],[-122.15,37.45]);
  renderRoute(start, end) {
    const map = this.state.map;
    var canvas = map.getCanvasContainer();

    canvas.style.cursor = '';

    this.labelPoint('start', start);
    this.labelPoint('end', end);

    this.requestRoute(start, end, false);
  }

  // make call to directions API - make sure server is running first!
  requestRoute(start, end, useMapbox) {
    const map = this.state.map;
    var url = 'http://localhost:8000/directions/' + (useMapbox ? "mapbox" : "safetymaps") + '/' + start[0] + ',' 
      + start[1] + '/' + end[0] + ',' + end[1] + '?access_token=' + mapboxgl.accessToken;
    var that = this;
    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function() {
      var json = JSON.parse(req.response);
      /*var route;
      if (useMapbox) {
        var data = json.routes[0];
        route = data.geometry.coordinates;
        console.log(data);
      } else {
        route = json.coords;
        if (typeof(route) === 'string' || route instanceof String) {
          console.log("Routing produced error: " + route);
          console.log("Falling back to mapbox API");
          that.requestRoute(start, end, true);
          return;
        }
        console.log(route);
      }*/
      if (!(json.success) && !(useMapbox)) {
        console.log("Routing produced error: " + json.error);
        console.log("Falling back to mapbox API");
        that.requestRoute(start, end, true);
        return;
      }
      if (!useMapbox) {
        console.log("Routing using SafetyMaps router")
      }
      that.setState({direction_list: json["turn-by-turn-directions"]});
      var route = json.coordinates;
      var geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };
      // render the route line
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      } else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route
              }
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
      //zoom oo the whole route
      map.fitBounds([start,end],
        {padding: {left: 500, right: 45, top: 45, bottom: 45}} //container: left margin(15) + width(440) = 455 -> 500-455 = 45px
      );
    };
    req.send();
  }
  
  renderExercise(obj){
    console.log(obj)

    const url = `http://localhost:8000/directions/${obj.start}/${obj.exerciseDuration}/${obj.exerciseChoice}`;
    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      const json = JSON.parse(req.response);
      console.log(json);
      // EVAN TODO: Handle map generation from response data
    }
    req.send();
  }

  render() {
    return (
      <div>
        <DirectionSidebar map = {this.state.map} renderRoute={this.renderRoute}renderExercise={this.renderExercise} direction_list={this.state.direction_list} />

        {/* <div className='sidebarStyle'>
          <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
        </div> */}

        <ProfileSidebar />

        <div ref={el => this.mapContainer = el} className='mapContainer' />
      </div>
    )
  }
}

export default Map;
