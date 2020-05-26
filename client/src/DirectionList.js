import React, { Component } from 'react';

import './DirectionList.css';

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

    formattedInstructions() {
        var instr = this.props.instructions;
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
                        {instr.map((instruction,index) => 
                            <li key={index}>
                                <p className="instruction">{instruction.label}</p>
                                <p className="distance">{this.formatDistance(instruction.distance)}</p>
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