import React, { Component } from 'react';
import { faMapPin, faMapMarkerAlt, faWalking, faBiking, faRunning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toggle from 'react-toggle'

import './DirectionSidebar.css';

import Geocoder from "./Geocoder"
import DirectionList from "./DirectionList"

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
            exerciseDuration: null,
            exerciseChoice: null,
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
                        <Geocoder map = {this.state.map} calculate={this.sendGeo} filling={this.fillTo} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleFrom} geocoder_identifier="geocoder_from" placeHolder="Enter your starting point"/>
                    </div>
                    <hr className="line"/>
                    <div id="to-wrapper">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="direction-icon"/> 
                        <Geocoder map = {this.state.map} calculate={this.sendGeo} filling={this.fillFrom} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleTo} geocoder_identifier="geocoder_to" placeHolder="Enter your destination"/>
                    </div>
                </div>
                <div id="exercise-mode" style={{display:`${this.state.isDisplayTrip?"none":"block"}`}}>
                    <h2>Let SafetyMaps generate an exercise route for you!</h2>
                    <input id="amount-time" placeholder="How much time do you have? (minutes)"/>
                    <div id="movement-mode-wrapper">
                        <div className="exercise-choice">
                            <input type="radio" id="walk" name="choice"/>
                            <label for="walk">
                                Walk
                                <FontAwesomeIcon icon={faWalking} className="exercise-icon"/> 
                            </label>
                        </div>
                        <div className="exercise-choice">
                            <input type="radio" id="run" name="choice"/>
                            <label for="run">
                                Run
                                <FontAwesomeIcon icon={faRunning} className="exercise-icon"/> 
                            </label>
                        </div>
                        <div className="exercise-choice">
                            <input type="radio" id="bike" name="choice"/>
                            <label for="bike">
                                Bike
                                <FontAwesomeIcon icon={faBiking} className="exercise-icon"/> 
                            </label>
                        </div>
                    </div>
                    <input id="generate-exercise-route" type="submit" value="Generate Route"/>
                </div>
                <DirectionList coords={this.props.coord_list} />
            </div>   
        )
    }
}

export default DirectionSidebar;