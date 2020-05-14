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
                    <h className="direction-text">From: </h>
                    <Geocoder map = {this.props.map} />
                    <hr className="line"/>
                    <h className="direction-text">To: </h>
                    <Geocoder map = {this.props.map} />
 
                    <button className="direction-button" onClick={this.sendGeo}>
                        Get Direction
                    </button>
                </div>
            </div>
            
        )
    }
}

export default DirectionSidebar;