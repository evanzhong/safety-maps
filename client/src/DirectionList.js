import React, { Component } from 'react';

import './DirectionList.css';

import constants from './constants';

class DirectionList extends Component {

    formatDistance(dist) {
        //dist starts off in m;
        dist = dist * 3.281; //convert to ft
        if (dist >= 528) { //0.1 miles
            dist /= 5280; //convert to miles
            return Math.round(dist * 10) / 10 + " mi"; //round to one decimal pt
        } else {
            return Math.round(dist) + " ft";
        }
    }

    formatTime(dist){
        dist = dist * 3.281 / 5280;
        switch (this.props.exerciseChoice) {
            case "walk":
                return (dist * 1 / constants.averageWalkingSpeed);
            case "run":
                return (dist * 1 / constants.averageRunningSpeed);
            case "bike":
                return (dist * 1 / constants.averageBikingSpeed);
            default:
                return (dist * 1 / constants.averageWalkingSpeed);
        }
    }

    formattedInstructions() {
        var instr = this.props.instructions;

        var total = 0;
        instr.forEach(element => total = total + element.distance);

        if (instr === null) {
            return (
            <div className="no-route">
                <h2>No Route Loaded</h2>
            </div>
            )
        } else {
            return (
                <div className="list">
                    <ol>
                        <div className="total-distance"> 
                            <span className="total-time-value">{Math.round(this.formatTime(total))} min </span> 
                            <span className="total-distance-value">({this.formatDistance(total)})</span>
                        </div>
                        {instr.map((instruction,index) => 
                            <li key={index}>
                                <div className="instruction-wrapper">
                                    <div className="instruction-img-wrapper">
                                        <img className="instruction-icon" src="https://image.flaticon.com/icons/svg/633/633705.svg"/><br/>
                                        <span className="instruction-distance">{this.formatDistance(instruction.distance)}</span>
                                    </div>
                                    <div className="instruction-text">
                                        {instruction.label}
                                    </div>
                                </div>
                            </li>    
                        )}
                    </ol>
                    
                </div>
            )
        }
    }

    render() {
        return (
            <div className="direction-list-wrapper">
                {this.formattedInstructions()}
            </div>
        )
    }
}

export default DirectionList;