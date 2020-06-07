import React, { Component } from 'react';

import './DirectionReview.css';

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

    getFormattedDate() {
        var today = new Date();
        var yr = today.getFullYear().toString().substring(2,4);
        return (today.getMonth()+1) + "/" + today.getDate() + "/" + yr
    }

    getFormattedTime() {
        var today = new Date();
        var hr = today.getHours();
        var setting = " am";
        if (hr >= 12) {
            hr -= 12;
            setting = " pm";
        }
        if (hr === 0) hr = 12;
        var min = today.getMinutes() >= 10 ? today.getMinutes() : "0" + today.getMinutes();
        return hr + ":" + min + setting;
    }

    makeName() {
        if (this.state.exerciseChoice) {
            return `${this.state.totalDistMiles} mile ${this.state.exerciseChoice} near ${this.props.exerciseStart[0]}`
        } else {
            return `${this.props.start[0]} to ${this.props.end[0]}`
        }
    }

    saveRouteForUser(numSeconds){
        // Build up the package to be sent to server
        // Make a copy of this.state.instructions in case state changes during function call
        let instructionsCopy = Object.assign(this.state.instructions);        
        console.log(instructionsCopy)
        const object = {
            name: this.makeName(),
            isExerciseMode: !!this.state.exerciseChoice,
            startName: this.state.exerciseChoice ? this.props.exerciseStart[0] : this.props.start[0],
            startAddr: this.state.exerciseChoice ? this.props.exerciseStart[1] : this.props.start[1],
            endName: this.state.exerciseChoice ? this.props.exerciseStart[0] : this.props.end[0],
            endAddr: this.state.exerciseChoice ? this.props.exerciseStart[1] : this.props.end[1],
            route: instructionsCopy,
            type: this.state.exerciseChoice ? this.state.exerciseChoice : 'walk', //Walk is the default exercise
            date: this.getFormattedDate(), //Will be time-stamped by the server
            time: this.getFormattedTime(), //Will be time-stamped by the server
            distance: this.state.totalDistMiles,
            runtime: numSeconds,
            favorite: false, //default to false
        }
        //console.log(object)

        //Start server call
        const url = "http://localhost:8000/auth/secure/save_route";

        let req = new XMLHttpRequest();
        req.open('POST', url, true);
        req.withCredentials = true;
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.onload = function() {
            window.refreshSavedRoutes();
        }
        req.send(JSON.stringify(object));
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