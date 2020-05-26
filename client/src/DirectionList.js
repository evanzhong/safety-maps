import React, { Component } from 'react';

import './DirectionList.css';

class DirectionList extends Component {

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
                                <p className="distance">For {instruction.distance} feet</p> {/* Not sure what the distance is in */}
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