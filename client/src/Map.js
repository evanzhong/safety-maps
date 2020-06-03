import React, { Component } from 'react';
import './Map.css';
import mapboxgl from 'mapbox-gl';

import DirectionSidebar from './DirectionSidebar';
import ProfileSidebar from './ProfileSidebar';
import WelcomePopup from './WelcomePopup';

import constants from './constants';

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
      //welcome popup
      welcome: true,
      dir_loading: false,
    };
    //For testing purposes - delete later
    window.map = this;
    window.profile_popup_open = false;
    this.renderRoute = this.renderRoute.bind(this);
    this.renderExercise = this.renderExercise.bind(this);
  }

  componentDidMount() {
    const open = localStorage.getItem('welcome') === null;

    //const showWelcome;
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    map.getCanvas().style.cursor = 'default';

    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    this.setState({map: map});

    map.on('mousedown',() => {
      map.getCanvas().style.cursor = 'all-scroll';
      if (window.profile_popup_open) {
        window.close_profile_popup();
      }
    })

    map.on('mouseup',() => {
      map.getCanvas().style.cursor = 'default';
    })

    this.setState({
      map: map,
      welcome: open,
      //welcome: true, //testing only
    });
  }

  doNotShowWelcome = () => {
    localStorage.setItem('welcome', 'false');
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

  drawRouteOnMap(json) {
    const map = this.state.map;
    this.setState({direction_list: json["turn-by-turn-directions"]});
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
  }

  clearRoute(clearGeocoders=true, exercise=false) {
    const map = this.state.map;
    if (!exercise) {
      window.clearExerciseAmountTime();
    }
    if (map.getLayer('route')) {
      map.removeLayer('route');
    }
    if (map.getSource('route')) {
      map.removeSource('route')
    }
    this.setState({direction_list: null});
    if (clearGeocoders) {
      for (var i=0; i < window.geocoder_list.length; ++i) {
          window.geocoder_list[i].clear();
      }
    }
  }

  zoomToCoords(start, end) {
    const map = this.state.map;
    //zoom oo the whole route
    map.fitBounds([start,end],
      {padding: {left: 500, right: 45, top: 45, bottom: 45}} //container: left margin(15) + width(440) = 455 -> 500-455 = 45px
    );
  }

  // render route using call to directions API
  // For testing purposes: try in Chrome console:
  // map.renderRoute([-122.1230542,37.4322595],[-122.15,37.45]);
  renderRoute(start, end) {
    //const map = this.state.map;
    //var canvas = map.getCanvasContainer();

    //canvas.style.cursor = '';

    //this.labelPoint('start', start);
    //this.labelPoint('end', end);

    this.requestRoute(start, end, false);
  }

  // make call to directions API - make sure server is running first!
  requestRoute(start, end, useMapbox) {
    this.clearRoute(false);
    this.setState({dir_loading: true});
    //const map = this.state.map;
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
      that.drawRouteOnMap(json);
      that.zoomToCoords(start, end);
      that.setState({dir_loading: false});
    };
    req.onerror = function() {
      that.setState({dir_loading: false});
    }
    req.send();
  }
  
  renderExercise(obj){
    this.clearRoute(false, true);
    this.setState({dir_loading: true});
    //console.log(obj)

    let totalDist;
    // Fall back on average speeds when user is not logged in
    switch (obj.exerciseChoice) {
      case "walk":
        totalDist = obj.exerciseDuration * constants.averageWalkingSpeed;
        break;
      case "run":
        totalDist = obj.exerciseDuration * constants.averageRunningSpeed;
        break;
      case "bike":
        totalDist = obj.exerciseDuration * constants.averageBikingSpeed;
        break;
      default:
        totalDist = obj.exerciseDuration * constants.averageWalkingSpeed;
        break;
    }

    const map = this.state.map;
    const that = this;
    const url = `http://localhost:8000/exercise/${obj.start}/${totalDist}?access_token=${mapboxgl.accessToken}`;

    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      const json = JSON.parse(req.response);
      console.log(json);
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
      that.setState({dir_loading: false});
    }
    req.onerror = function() {
      that.setState({dir_loading: false});
    }
    req.send();
  }

  render() {
    return (
      <div>       
        <div>
          <DirectionSidebar dir_loading={this.state.dir_loading} map = {this.state.map} 
            renderRoute={this.renderRoute}renderExercise={this.renderExercise} direction_list={this.state.direction_list} />
          <ProfileSidebar />
          <WelcomePopup doNotShowWelcome={this.doNotShowWelcome} open={this.state.welcome}/>
        </div>
        <div ref={el => this.mapContainer = el} className='mapContainer' />
      </div>
    )
  }
}

export default Map;
