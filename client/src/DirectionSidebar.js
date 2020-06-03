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

            from_address1: null,
            from_address2: null,

            to_address1: null,
            to_address2: null,

            exercise_address1: null,
            exercise_address2: null,

            loading_choices: ["Loading Route", "Optimizing for Safety", "Analyzing Paths", "Generating Directions", "Final Countdown"],
            loading_current_index: 0,
            interval_on: false,
        }
        this.sendGeo = this.sendGeo.bind(this);
    }

    componentWillReceiveProps(props) {
        // Not sure if it needs to guarantee that this runs only once
        const map = props.map;
        this.setState({map: map});
    }

    componentWillUnmount() {
        clearInterval(this.interval);
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

    unfillFrom = () => {
        this.setState({
            fromFilled: false,
        })
    }

    unfillTo = () => {
        this.setState({
            toFilled: false,
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
    }

    getFromAddress = (address) => {
        let divided1 = address.split(/,(.+)/)[0];
        let divided2 = address.split(/,(.+)/)[1];

        this.setState({
            from_address1: divided1,
            from_address2: divided2,
        })
    }

    getToAddress = (address) => {
        let divided1 = address.split(/,(.+)/)[0];
        let divided2 = address.split(/,(.+)/)[1];

        this.setState({
            to_address1: divided1,
            to_address2: divided2,
        })
    }

    getExerciseAddress = (address) => {
        let divided1 = address.split(/,(.+)/)[0];
        let divided2 = address.split(/,(.+)/)[1];

        this.setState({
            exercise_address1: divided1,
            exercise_address2: divided2,
        })
    }

    // EXERCISE MODE:
    handleExerciseInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        if (target.name === "choice") {
            this.setState({exerciseChoice: value});
        }
        else{
            this.setState({exerciseDuration: value});
        }
    }
    
    sendExercise = () => {
        if (this.state.exerciseChoice === null || this.state.exerciseDuration === null) {
            console.log("Error! You must select both a duration of exercise and a choice of exercise")
            return;
        }
        const obj = {
            start: this.state.from,
            exerciseDuration: this.state.exerciseDuration,
            exerciseChoice: this.state.exerciseChoice,
            // EVAN TODO: include token or uID here for personalied pace?
        }
        this.props.renderExercise(obj)
    }

    componentDidUpdate() {
        if (this.props.dir_loading && (!this.state.interval_on)) {
            this.interval = setInterval(() => {
                this.setState({loading_current_index: (this.state.loading_current_index+1)%this.state.loading_choices.length})
            }, 1650)
            this.setState({interval_on: true});
        }

        if (this.state.interval_on && (!this.props.dir_loading)) {
            clearInterval(this.interval);
            this.setState({interval_on: false, loading_current_index: 0});
        }
    }
    
    render() {

        return (
            <div className = 'direction-container'>
                <div className="direction-load-block" style={this.props.dir_loading ? {height:"100%"} : {height:"0%"}}/>
                <div className = "user-dir-container">
                    <div className= "toggle-container">
                        <label>
                            <Toggle
                                defaultChecked={this.state.toggleDefault}
                                icons={{
                                checked: "Exercise",
                                unchecked: "Trip",
                                }}
                            onChange={() => {
                                    window.map.clearRoute();
                                    this.setState({isDisplayTrip: !this.state.isDisplayTrip})}
                                } />
                        </label>
                    </div>
                    {/* TRAVEL MODE */}
                    <div id="travel-mode" style={{display:`${this.state.isDisplayTrip?"block":"none"}`}}>
                        <div id="from-wrapper">
                            <FontAwesomeIcon icon={faMapPin} className="direction-icon"/> 
                            <Geocoder map = {this.state.map} getAddress={this.getFromAddress} calculate={this.sendGeo} filling={this.fillTo} unfilling={this.unfillTo} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleFrom} geocoder_identifier="geocoder_from" placeHolder="Enter your starting point"/>
                        </div>
                        <hr className="line"/>
                        <div id="to-wrapper">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="direction-icon"/> 
                            <Geocoder map = {this.state.map} getAddress={this.getToAddress} calculate={this.sendGeo} filling={this.fillFrom} unfilling={this.unfillFrom} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleTo} geocoder_identifier="geocoder_to" placeHolder="Enter your destination"/>
                        </div>
                    </div>
                     
                     {/* EXERCISE MODE */}
                    <div id="exercise-mode" style={{display:`${this.state.isDisplayTrip?"none":"block"}`}}>
                        <h2>Let SafetyMaps generate an exercise route for you!</h2>
                        <input id="amount-time" placeholder="How much time do you have? (minutes)" type="number" onChange={this.handleExerciseInputChange}/>
                        <Geocoder map = {this.state.map} result={this.handleFrom} filling={()=>{}} calculate={() => {}} unfilling={() => {}} getAddress={this.getExerciseAddress} geocoder_identifier="geocoder_start" placeHolder="Enter your starting point"/>
                        <div id="movement-mode-wrapper">
                            <div className="exercise-choice">
                                <input type="radio" id="walk" name="choice" value="walk" onChange={this.handleExerciseInputChange}/>
                                <label htmlFor="walk">
                                    Walk
                                    <FontAwesomeIcon icon={faWalking} className="exercise-icon"/> 
                                </label>
                            </div>
                            <div className="exercise-choice">
                                <input type="radio" id="run" name="choice" value="run" onChange={this.handleExerciseInputChange}/>
                                <label htmlFor="run">
                                    Run
                                    <FontAwesomeIcon icon={faRunning} className="exercise-icon"/> 
                                </label>
                            </div>
                            <div className="exercise-choice">
                                <input type="radio" id="bike" name="choice" value="bike" onChange={this.handleExerciseInputChange}/>
                                <label htmlFor="bike">
                                    Bike
                                    <FontAwesomeIcon icon={faBiking} className="exercise-icon"/> 
                                </label>
                            </div>
                        </div>
                        <input id="generate-exercise-route" type="submit" value="Generate Route" onClick={this.sendExercise}/>
                    </div>
                </div>
                <div className="route-loading" style={this.props.dir_loading ? {display:"inherit"} : {display: "none"}}>{this.state.loading_choices[this.state.loading_current_index]}</div>
                {this.props.direction_list !== null ?
                <div className="direction_list-container" style={this.state.isDisplayTrip ? {"maxHeight": "calc(90vh - 230px)"} : {"maxHeight": "calc(90vh - 400px)"}}>
                    <div className="address-container">
                        <h3 className="main-address">{this.state.isDisplayTrip ? this.state.from_address1 : this.state.exercise_address1}</h3>
                        {this.state.isDisplayTrip ? this.state.from_address2 : this.state.exercise_address2}
                    </div>
                    <DirectionList instructions={this.props.direction_list} exerciseChoice={this.state.exerciseChoice}/>
                    <div className="address-container">
                        <h3 className="main-address">{this.state.isDisplayTrip ? this.state.to_address1 : this.state.exercise_address1}</h3>
                        {this.state.isDisplayTrip ? this.state.to_address2 : this.state.exercise_address2}
                    </div>
                </div>
                :""}
            </div>   
        )
    }
}

export default DirectionSidebar;