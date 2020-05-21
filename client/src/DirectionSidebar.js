import React, { Component } from 'react';
import { faMapPin, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toggle from 'react-toggle'

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
            toFilled: false,
            fromFilled: false,
            isDisplayTrip: true,
        }
        this.sendGeo = this.sendGeo.bind(this);
    }

    componentWillReceiveProps(props) {
        // Not sure if it needs to guarantee that this runs only once
        const map = props.map;
        this.setState({map: map});
    }

    fillFrom = () => {
        this.setState({
            fromFilled: true,
        })
    }

    fillTo = () => {
        this.setState({
            toFilled: true,
        })
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
                <div className= "toggle-container">
                    <label>
                        <Toggle
                            defaultChecked={this.state.toggleDefault}
                            icons={{
                            checked: "Exercise",
                            unchecked: "Trip",
                            }}
                        onChange={() => this.setState({isDisplayTrip: !this.state.isDisplayTrip})} />
                    </label>
                </div>
                <div id="travel-mode" style={{display:`${this.state.isDisplayTrip?"block":"none"}`}}>
                    <div id="from-wrapper">
                        <FontAwesomeIcon icon={faMapPin} className="direction-icon"/> 
                        <Geocoder map = {this.state.map} result={this.handleFrom} geocoder_identifier="geocoder_from" placeHolder="Enter your starting point"/>
                    </div>
                    <hr className="line"/>
                    <div id="to-wrapper">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="direction-icon"/> 
                        <Geocoder map = {this.state.map} result={this.handleTo} geocoder_identifier="geocoder_to" placeHolder="Enter your destination"/>
                    </div>
                </div>
                <div id="exercise-mode" style={{display:`${this.state.isDisplayTrip?"none":"block"}`}}>
                    <h1>How much time do you have?</h1>
                    <input/>
                    <div>
                        <div>
                            <label>Walk</label>
                            <input type="radio"/>
                        </div>
                        <div>
                            <label>Run</label>
                            <input type="radio"/>
                        </div>
                        <div>
                            <label>Bike</label>
                            <input type="radio"/>
                        </div>
                    </div>
                </div>
            </div>   
        )
    }
}

export default DirectionSidebar;