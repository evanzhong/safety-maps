import React, { Component } from 'react';
import './DirectionSidebar.css';

import Geocoder from "./Geocoder"

class DirectionSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
        this.sendGeo = this.sendGeo.bind(this);
    }

        sendGeo = () => {
            console.log("hi");
        }

    render() {
        return (
            <div className = 'direction-container'>
                <div className="direction-box">
                    <div id="from-wrapper">
                        <h className="direction-text">From: </h>
                        <Geocoder map = {this.props.map} />
                    </div>
                    <hr className="line"/>
                    <div id="to-wrapper">
                        <h className="direction-text">To: </h>
                        <Geocoder map = {this.props.map} />
                    </div>
 
                    <button className="direction-button" onClick={this.sendGeo}>
                        Get Direction
                    </button>
                </div>
            </div>
            
        )
    }
}

export default DirectionSidebar;