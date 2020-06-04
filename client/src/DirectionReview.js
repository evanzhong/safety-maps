import React, { Component } from 'react';
import { faMapPin, faMapMarkerAlt, faWalking, faBiking, faRunning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toggle from 'react-toggle'

import './DirectionReview.css';

import Geocoder from "./Geocoder"
import DirectionList from "./DirectionList"
import Button from "./button"

class DirectionReview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            instructions: null,
            exerciseChoice: null,
            totalDistMiles: -1,
        }
        // saveRouteForUser is passed as a callback to the Button component, thus we need to bind it
        this.saveRouteForUser = this.saveRouteForUser.bind(this);
    }

    componentDidMount(){
        let total = 0;
        this.props.instructions["turn-by-turn-directions"].forEach(element => total = total + element.distance);
        total = Math.round(total * 3.281 / 5280 * 10) / 10; //Round to 1 decimal place

        this.setState({
            instructions: this.props.instructions,
            exerciseChoice: this.props.exerciseChoice ? this.props.exerciseChoice : null,
            totalDistMiles: total,
        })
    }

    saveRouteForUser(numSeconds){
        // Build up the package to be sent to server
        // Make a copy of this.state.instructions in case state changes during function call
        let instructionsCopy = Object.assign(this.state.instructions);        
        console.log(instructionsCopy)
        const object = {
            name: `${this.state.totalDistMiles} mile ${this.state.exerciseChoice ? this.state.exerciseChoice : 'walk'}`,
            isExerciseMode: !!this.state.exerciseChoice,
            startName: this.state.exerciseChoice ? this.props.exerciseStart[0] : this.props.start[0],
            startAddr: this.state.exerciseChoice ? this.props.exerciseStart[1] : this.props.start[1],
            endName: this.state.exerciseChoice ? this.props.exerciseStart[0] : this.props.end[0],
            endAddr: this.state.exerciseChoice ? this.props.exerciseStart[1] : this.props.end[1],
            route: instructionsCopy,
            type: this.state.exerciseChoice ? this.state.exerciseChoice : 'walk', //Walk is the default exercise
            date: null, //Will be time-stamped by the server
            time: null, //Will be time-stamped by the server
            distance: this.state.totalDistMiles,
            runtime: numSeconds,
            favorite: false, //default to false
        }
        console.log(object)

        //Start server call
        const url = `http://localhost:8000/auth/secure/save_route/?object=${JSON.stringify(object)}`;

        let req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.withCredentials = true;
        req.onload = function() {
            
        }
        req.send();
    }
    
    render() {
        return (
            <div>
                <div className="review-container">
                    <Button onClickCallback={this.saveRouteForUser}/>
                </div>
            </div>
        )
    }
}

export default DirectionReview;