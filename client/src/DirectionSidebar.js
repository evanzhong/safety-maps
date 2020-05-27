import React, { Component } from 'react';
import { faMapPin, faMapMarkerAlt/*, faWalking, faRunning, faBiking*/ } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toggle from 'react-toggle'

import './DirectionSidebar.css';

import Geocoder from "./Geocoder"
import DirectionList from "./DirectionList"

class DirectionSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
            result1: null,
            result2: null,
            from: [],
            to: [],
            toFilled: false,
            fromFilled: false,
            isDisplayTrip: true,

            from_address1: null,
            from_address2: null,

            to_address1: null,
            to_address2: null,
        }
        this.sendGeo = this.sendGeo.bind(this);
    }

    componentWillReceiveProps(props) {
        // Not sure if it needs to guarantee that this runs only once
        const map = props.map;
        this.setState({map: map});
    }

    fillFrom = () => {
        this.setState({
            fromFilled: true,
        })
    }

    fillTo = () => {
        this.setState({
            toFilled: true,
        })
    }

    handleFrom = (from) => {
        this.setState({
            from: from,
        })
    }

    handleTo = (to) => {
        this.setState({
            to: to,
        })
    }

    sendGeo = () => {
        this.props.renderRoute(this.state.from, this.state.to);
    }

    getFromAddress = (address) => {
        let divided1 = address.split(/,(.+)/)[0];
        let divided2 = address.split(/,(.+)/)[1];

        this.setState({
            from_address1: divided1,
            from_address2: divided2,
        })
    }

    getToAddress = (address) => {
        let divided1 = address.split(/,(.+)/)[0];
        let divided2 = address.split(/,(.+)/)[1];

        this.setState({
            to_address1: divided1,
            to_address2: divided2,
        })
    }

    render() {
        return (
            <div className = 'direction-container'>
                <div className = "user-dir-container">
                    <div className= "toggle-container">
                        <label>
                            <Toggle
                                defaultChecked={this.state.toggleDefault}
                                icons={{
                                checked: "Exercise",
                                unchecked: "Trip",
                                }}
                            onChange={() => this.setState({isDisplayTrip: !this.state.isDisplayTrip})} />
                        </label>
                    </div>
                    <div id="travel-mode" style={{display:`${this.state.isDisplayTrip?"block":"none"}`}}>
                        <div id="from-wrapper">
                            <FontAwesomeIcon icon={faMapPin} className="direction-icon"/> 
                            <Geocoder map = {this.state.map} getAddress={this.getFromAddress} calculate={this.sendGeo} filling={this.fillTo} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleFrom} geocoder_identifier="geocoder_from" placeHolder="Enter your starting point"/>
                        </div>
                        <hr className="line"/>
                        <div id="to-wrapper">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="direction-icon"/> 
                            <Geocoder map = {this.state.map} getAddress={this.getToAddress} calculate={this.sendGeo} filling={this.fillFrom} from={this.state.fromFilled} to={this.state.toFilled} result={this.handleTo} geocoder_identifier="geocoder_to" placeHolder="Enter your destination"/>
                        </div>
                    </div>
                    <div id="exercise-mode" style={{display:`${this.state.isDisplayTrip?"none":"block"}`}}>
                        <p className="distance-miles">miles</p>
                        <input className="distance-input"/>
                        <h2>Goal Distance: </h2>
                        <div>
                            <div>
                                <label>Walk</label>
                                <input type="radio"/>
                            </div>
                            <div>
                                <label>Run</label>
                                <input type="radio"/>
                            </div>
                            <div>
                                <label>Bike</label>
                                <input type="radio"/>
                            </div>
                        </div>
                    </div>
                    {/* <div className="direction-title">
                        <h2>Direction</h2>
                    </div> */}
                </div>
                {this.props.direction_list !== null ?
                <div className="direction_list-container">
                    <div className="address-container">
                        <h3 className="main-address">{this.state.from_address1}</h3>
                        {this.state.from_address2}
                    </div>
                    <DirectionList instructions={this.props.direction_list}/>
                    <div className="address-container">
                        <h3 className="main-address">{this.state.to_address1}</h3>
                        {this.state.to_address2}
                    </div>
                </div>
                :""}
            </div>   
        )
    }
}

export default DirectionSidebar;