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
            exerciseChoice: this.props.exerciseChoice ? this.props.exerciseChoice : 'walk', //Walk is the default exercise
            totalDistMiles: total,
        })
    }

    saveRouteForUser(numSeconds){
        // Build up the package to be sent to server
        // Make a copy of this.state.instructions in case state changes during function call
        let instructionsCopy = Object.assign(this.state.instructions);        
        console.log(instructionsCopy)
        const object = {
            name: `${this.state.totalDistMiles} mile ${this.state.exerciseChoice}`,
            start: null, //Will be calculated by the server
            end: null, //Will be calculated by the server
            route: instructionsCopy,
            type: this.state.exerciseChoice,
            date: null, //Will be time-stamped by the server
            time: null, //Will be time-stamped by the server
            distance: this.state.totalDistMiles,
            runtime: numSeconds,
            favorite: false, //default to false
        }
        console.log(object)

        //Start server call
        // const url = "http://localhost:8000/auth/secure/save_route";

        // let req = new XMLHttpRequest();
        // req.open('POST', url, true);
        // req.withCredentials = true;
        // req.setRequestHeader('Content-Type', 'application/json')
        // req.onreadystatechange = function() {
        //     if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        //         // Request finished. Do processing here.
        //     }
        // }
        // req.send(object)
    
        fetch("http://localhost:8000/auth/secure/save_route", {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify(object),
            body: {'test': 'test'}
        });
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