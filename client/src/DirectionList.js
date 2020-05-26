import React, { Component } from 'react';

import './DirectionList.css';

class DirectionList extends Component {

    formattedInstructions() {
        var instr = this.props.instructions;
        if (instr === null) {
            return "No Route Loaded";
        } else {
            return (
                <ol>
                    {instr.map((instruction,index) => 
                        <li key={index}>
                            {instruction.label}<br/>
                            {instruction.distance}
                        </li>    
                    )}
                </ol>
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