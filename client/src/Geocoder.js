import React, { Component } from 'react';

import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

import "./Geocoder.css"

class Geocoder extends Component {
    componentDidMount() {
        var geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        });

        document.getElementById('geocoder').appendChild(geocoder.onAdd(this.props.map))
    }
    
    

    render() {
        return(
            <div>
                <div id= "geocoder" className="geocoder"></div>
            </div>
        )
    }
}

export default Geocoder;