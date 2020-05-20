import React, { Component } from 'react';

import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

import "./Geocoder.css"

class Geocoder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            num: 0,
        }
    }

    componentWillReceiveProps(props) {
        var num = this.state.num;
        if (num === 0)
        {
            var geocoder = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
                getItemValue: geopoint => {
                    var lat = geopoint.geometry.coordinates[0];
                    var long = geopoint.geometry.coordinates[1];
                    var coord = [lat, long];
                    this.props.result(coord);
                    return geopoint.place_name;
                },
                placeholder: this.props.placeHolder,
            });
            document.getElementById(this.props.geocoder_identifier).appendChild(geocoder.onAdd(props.map))
            num++;
            this.setState({num: num});
        }        
    }
    
    render() {
        return(
            <div id={this.props.geocoder_identifier} className="geocoder"></div>
        )
    }
}

export default Geocoder;