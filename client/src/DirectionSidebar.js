import React, { Component } from 'react';
import { faMapPin, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './DirectionSidebar.css';

import Geocoder from "./Geocoder"

class DirectionSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
            result1: null,
            result2: null,
            from: [],
            to: [],
        }
        this.sendGeo = this.sendGeo.bind(this);
    }

    componentWillReceiveProps(props) {
        // Not sure if it needs to guarantee that this runs only once
        const map = props.map;
        this.setState({map: map});
    }

    handleFrom = (from) => {
        this.setState({
            from: from,
        })
    }

    handleTo = (to) => {
        this.setState({
            to: to,
        })
    }

    sendGeo = () => {
        this.props.renderRoute(this.state.from, this.state.to);
        console.log("success");
    }

    render() {
        return (
            <div className = 'direction-container'>
                <div id="from-wrapper">
                    <FontAwesomeIcon icon={faMapPin} className="direction-icon"/> 
                    <Geocoder map = {this.state.map} result={this.handleFrom} geocoder_identifier="geocoder_from" placeHolder="Enter your starting point"/>
                </div>
                <hr className="line"/>
                <div id="to-wrapper">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="direction-icon"/> 
                    <Geocoder map = {this.state.map} result={this.handleTo} geocoder_identifier="geocoder_to" placeHolder="Enter your destination"/>
                </div>
                <button className="direction-button" onClick={this.sendGeo}>
                    Get Direction
                </button>
            </div>
            
        )
    }
}

export default DirectionSidebar;