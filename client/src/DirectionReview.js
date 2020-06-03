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
        }
    }
    
    render() {
        return (
            <div>
                <div className="review-container">
                    <Button/>
                </div>
            </div>
        )
    }
}

export default DirectionReview;