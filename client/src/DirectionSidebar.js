import React, { Component } from 'react';
import { faMapPin, faMapMarkerAlt, faWalking, faBiking, faRunning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toggle from 'react-toggle'

import './DirectionSidebar.css';

import Geocoder from "./Geocoder"
import DirectionList from "./DirectionList"
import DirectionReview from "./DirectionReview"

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
            exercise_set: false,
            exercise_error: "",

            loading_choices: ["Loading Route", "Optimizing for Safety", "Analyzing Paths", "Generating Directions", "Final Countdown"],
            loading_current_index: 0,
            interval_on: false,
        }
        this.sendGeo = this.sendGeo.bind(this);
        window.clearExerciseAmountTime = () => {
            this.setState({exerciseDuration: null});
            document.getElementById("amount-time").value = "";
        }
        window.setFromFullAddr = (fullAddr) => {
            this.getFromAddress(fullAddr);
        }
        window.setToFullAddr = (fullAddr) => {
            this.getToAddress(fullAddr);
        }
        window.setExerFullAddr = (fullAddr) => {
            this.getExerciseAddress(fullAddr);
        }
        window.setIsDisplayTrip = (boolean) => {
            this.setState({isDisplayTrip: boolean});
        }
        window.setExerciseChoice = (choice) => {
            this.setState({exerciseChoice: choice});
        }
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

    fillExercise = () => {
        this.setState({
            exercise_set: true
        }) 
    }

    unfillExercise = () => {
        this.setState({
            exercise_set: false
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



    validateExerciseInput() {
        if (this.state.exerciseChoice == null) {
            return "You must choose an exercise type!";
        }
        if (this.state.exerciseDuration == null || (isNaN(this.state.exerciseDuration)) || (!Number.isInteger(parseInt(this.state.exerciseDuration)))) {
            return "You must specify a numeric exercise duration!"
        }
        if (parseInt(this.state.exerciseDuration) < 0 || parseInt(this.state.exerciseDuration) > 120) {
            return "Duration must be between 1 and 120 minutes!"
        }
        if (!this.state.exercise_set) {
            return "You must select a starting address!"
        }
        return ""
    }
    
    sendExercise = () => {
        let validation_str = this.validateExerciseInput();
        this.setState({exercise_error: validation_str});
        if (validation_str !== "") {
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

        let exercise_err_str = this.validateExerciseInput()
        if (this.state.exercise_error !== "" && exercise_err_str === "") {
            this.setState({exercise_error: ""})
        }
    }
    
    render() {
        let exercise_err_str = this.validateExerciseInput()
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
                                checked={!this.state.isDisplayTrip}
                            onChange={() => {
                                    window.map.clearRoute();
                                    this.setState({isDisplayTrip: !this.state.isDisplayTrip});
                                }
                                } />
                        </label>
                    </div>
                    {/* TRAVEL MODE */}
                    <div id="travel-mode" style={{display:`${this.state.isDisplayTrip?"block":"none"}`}}>
                        <div id="from-wrapper">
                            <FontAwesomeIcon icon={faMapPin} className="direction-icon"/> 
                            <Geocoder map = {this.state.map} getAddress={this.getFromAddress} calculate={this.sendGeo} filling={this.fillTo}
                            unfilling={this.unfillTo} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleFrom} geocoder_identifier="geocoder_from" 
                            onResult={() => {}} placeHolder="Enter your starting point"/>
                        </div>
                        <hr className="line"/>
                        <div id="to-wrapper">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="direction-icon"/> 
                            <Geocoder map = {this.state.map} getAddress={this.getToAddress} calculate={this.sendGeo} filling={this.fillFrom} 
                            unfilling={this.unfillFrom} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleTo} geocoder_identifier="geocoder_to"
                            onResult={() => {}} placeHolder="Enter your destination"/>
                        </div>
                    </div>
                     
                     {/* EXERCISE MODE */}
                    <div id="exercise-mode" style={{display:`${this.state.isDisplayTrip?"none":"block"}`}}>
                        <div className="exercise-title">
                        <h3>Generate an Exercise Route</h3>
                        </div>
                        <input id="amount-time" placeholder="Set Time Limit (min)" type="number" onChange={this.handleExerciseInputChange}/>
                        <div className="exercise-geocoder-container">
                            <Geocoder map = {this.state.map} result={this.handleFrom} filling={()=>{}} calculate={() => {}} 
                                unfilling={this.unfillExercise} getAddress={this.getExerciseAddress} geocoder_identifier="geocoder_start" 
                                onResult={this.fillExercise} placeHolder="Enter your starting point" />
                        </div>
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
                        <input id="generate-exercise-route" type="submit" value="Generate Route" onClick={this.sendExercise}
                            style={exercise_err_str==="" ? {
                                "backgroundColor": "teal"
                            } : (this.state.exercise_error === "" ? null : {
                                "borderRadius": "3px",
                                "border": "2px solid rgb(243, 120, 120)"
                              })} />
                        {this.state.exercise_error === "" || exercise_err_str==="" ? null : 
                            <div className="generate-exercise-error">
                                {this.state.exercise_error}
                            </div>
                        }
                    </div>
                </div>
                <div className="route-loading" style={this.props.dir_loading ? {display:"inherit"} : {display: "none"}}>{this.state.loading_choices[this.state.loading_current_index]}</div>
                {(this.props.direction_list !== null && this.props.json_full !== null)?
                <div className="direction_list-container" style={this.state.isDisplayTrip ? {"maxHeight": "calc(90vh - 230px)"} : {"maxHeight": "calc(90vh - 400px)"}}>
                    <div className="address-container">
                        <h3 className="main-address">{this.state.isDisplayTrip ? this.state.from_address1 : this.state.exercise_address1}</h3>
                        {this.state.isDisplayTrip ? this.state.from_address2 : this.state.exercise_address2}
                    </div>
                    <DirectionList instructions={this.props.direction_list} exerciseChoice={this.state.exerciseChoice} isDisplayTrip={this.state.isDisplayTrip} />
                    <div className="address-container">
                        <h3 className="main-address">{this.state.isDisplayTrip ? this.state.to_address1 : this.state.exercise_address1}</h3>
                        {this.state.isDisplayTrip ? this.state.to_address2 : this.state.exercise_address2}
                    </div>
                    {
                        (((this.state.from_address1 !== null && this.state.from_address2 !== null && this.state.to_address1 !== null && this.state.to_address2 !== null) || (this.state.exercise_address1 !== null && this.state.exercise_address2 !== null)) && window.isUserLoggedIn())
                        ? <DirectionReview instructions={this.props.json_full} exerciseChoice={this.state.exerciseChoice} start={[this.state.from_address1, this.state.from_address2]} end={[this.state.to_address1, this.state.to_address2]} exerciseStart={[this.state.exercise_address1, this.state.exercise_address2]}/>
                        : ""
                    }
                </div>
                :""}
            </div>   
        )
    }
}

export default DirectionSidebar;