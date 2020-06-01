import React, { Component } from 'react';

import { faWalking, faBiking, faRunning, faHeart, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { faHeart as heartOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './HistoryScreen.css';

class HistoryScreen extends Component {
    render() {
        return (
            <div className="historyPopup">
                <h1>Saved Routes</h1>
                <RouteList history={this.props.history} />
            </div>
        );
    }
}

class RouteList extends Component {
    render() {
        if (this.props.history == null) {
            return "No route history";
        }
        return (
            <div className="route-list">
            {this.props.history.map((route,index) => 
                <RouteEntry key={index} first_row={index === 0} route={route}/>
            )}
            </div>
        );
    }
}

class RouteEntry extends Component {
    calculateSpeed() {
        const dist = this.props.route.distance * 0.621371; // km -> mi
        const time = this.props.route.runtime/3600; // sec -> hrs
        return Math.round(dist/time*10)/10; //mph to one decimal pt
    }
    render() {
        const route = this.props.route;

        var icon;
        if (route.type === "walk") {
            icon = faWalking;
        } else if (route.type === "run") {
            icon = faRunning;
        } else {
            icon = faBiking;
        }

        return (
            <div className="route-row" id={this.props.first_row ? "first-route-row" : ""}>
                <div className="route-date">
                    {route.date + " at " + route.time}
                </div>
                <div className="route-runtype">
                    <FontAwesomeIcon icon={icon} className="route-runtype-icon"/> 
                </div>
                <div className="route-name">
                    {route.name}
                </div>
                {/* <div className="route-speed">
                    {this.calculateSpeed() + " mph"}
                </div>
                <div className="route-favorite">
                    <FontAwesomeIcon icon={faHeart} className="route-favorite-icon"/> 
                </div> */}
                <div className="route-expand">
                    <FontAwesomeIcon icon={faAngleDown} className="route-expand-icon"/> 
                </div>
                <div className="route-favorite">
                    <FontAwesomeIcon icon={route.favorite ? faHeart : heartOutline} className="route-favorite-icon"/> 
                </div>
                <div className="route-speed">
                    {this.calculateSpeed() + " mph"}
                </div>
            </div>
        )
    }
}

export default HistoryScreen;