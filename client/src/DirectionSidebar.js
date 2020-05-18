import React, { Component } from 'react';
import './DirectionSidebar.css';

import Geocoder from "./Geocoder"

class DirectionSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            map: null,
            result1: null,
            result2: null,
            from: [],
            to: [],
        }
        this.sendGeo = this.sendGeo.bind(this);
    }

    componentWillReceiveProps(props) {
        // Not sure if it needs to guarantee that this runs only once
        const map = props.map;
        this.setState({map: map});
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
        console.log("success");
    }

    render() {
        return (
            <div className = 'direction-container'>
                <div className="direction-box">
                    <div id="from-wrapper">
                        <h className="direction-text">From: </h>
                        <Geocoder map = {this.state.map} result={this.handleFrom}/>
                    </div>
                    <hr className="line"/>
                    <div id="to-wrapper">
                        <h className="direction-text">To: </h>
                        <Geocoder map = {this.state.map} result={this.handleTo} />
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