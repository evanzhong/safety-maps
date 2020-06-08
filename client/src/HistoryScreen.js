import React, { Component } from 'react';
import Popup from "reactjs-popup";

import { faWalking, faBiking, faRunning, faHeart, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { faHeart as heartOutline, faEye, faTrashAlt, faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import './HistoryScreen.css';

class HistoryScreen extends Component {
    render() {
        return (
            <div className="historyPopup">
                <h1>{this.props.favoritesOnly ? "Favorite Routes" : "Recent Routes"}</h1>
                <RouteList favoritesOnly={this.props.favoritesOnly} closePopup={this.props.closePopup} history={this.props.history} />
            </div>
        );
    }
}

class RouteList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded_route:-1,
        }
        this.setExpanded.bind(this);
    }

    setExpanded(n) {
        if (this.state.expanded_route !== n)
            this.setState({expanded_route: n});
        else
            this.setState({expanded_route: -1});
    }

    render() {
        if (this.props.history == null) {
            return "No route history";
        }
        var global_index = -1;
        return (
            <div className="route-list">
            {this.props.history.slice(0).reverse().map((route) => {
                if ((!this.props.favoritesOnly) || route.favorite) {
                    global_index++;
                    var index = global_index;
                    return <RouteEntry key={index} closePopup={this.props.closePopup} expanded={index === this.state.expanded_route} 
                        expand_click={() => this.setExpanded(index)} row_id={index} route={route}/>
                }
                return null
            })}
            </div>
        );
    }
}

class RouteEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deletePopupOpen: false
        }
    }

    openDeletePopup() {
        this.setState({deletePopupOpen: true})
    }

    closeDeletePopup() {
        this.setState({deletePopupOpen: false})
    }

    calculateSpeed() {
        const dist = this.props.route.distance;
        const time = this.props.route.runtime/3600; // sec -> hrs
        return Math.round(dist/time*10)/10; //mph to one decimal pt
    }
    formatDistance() {
        //dist starts off in m;
        var dist = this.props.route.distance * 5280; //convert mi -> ft
        if (dist >= 528) { //0.1 miles
            dist /= 5280; //convert to miles
            return Math.round(dist * 10) / 10 + " mi"; //round to one decimal pt
        } else {
            return Math.round(dist) + " ft";
        }
    }

    formatRuntime() {
        var time = this.props.route.runtime;
        var formatted = ""
        if (time >= 3600) {
            var hours = Math.trunc(time/3600);
            formatted += hours + " hours, ";
            time -= hours*3600;
        }
        if (time >= 60) {
            var min = Math.trunc(time/60);
            formatted += min + " minutes, ";
            time -= min*60;
        }
        formatted += time + " seconds"
        return formatted;
    }

    onFavorite(routeId, fav) {
        window.updateRouteFavorite(routeId, fav);
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
            <div className="route-row" id={this.props.row_id === 0 ? "first-route-row" : ""}>
                <div className="route-date">
                    {route.date + " at " + route.time}
                </div>
                <div className="route-runtype">
                    <FontAwesomeIcon icon={icon} className="route-runtype-icon"/> 
                </div>
                <div className="route-name">
                    {route.name}
                </div>
                <div className="route-expand">
                    <FontAwesomeIcon icon={this.props.expanded ? faAngleUp : faAngleDown} onClick={this.props.expand_click} className="route-expand-icon"/> 
                </div>
                <div className="route-delete">
                    <FontAwesomeIcon icon={faTrashAlt} className="route-delete-icon" onClick={
                        () => this.openDeletePopup()   
                    } />
                </div>
                <DeletePopup open={this.state.deletePopupOpen} closePopup={()=>this.closeDeletePopup()} routeId={route._id}/>
                <div className="route-navigate">
                    <FontAwesomeIcon icon={faEye} onClick={() => {
                            window.map.drawRouteOnMap(this.props.route.route);
                            const coords = this.props.route.route.coordinates;
                            if (!route.isExerciseMode) window.map.zoomToCoords(coords[0],coords[coords.length-1]);
                            this.props.closePopup();

                            if(route.isExerciseMode) {
                                window.setIsDisplayTrip(false);
                                document.querySelector("#amount-time").value = Math.round(route.runtime/60);
                                document.querySelector("#geocoder_start .mapboxgl-ctrl-geocoder--input").value = route.startName;
                                document.querySelector(`input#${route.type}`).checked = true;
                                window.setExerFullAddr(`${route.startName},${route.startAddr}`)
                                window.setExerciseChoice(route.type)
                            }
                            else {
                                window.setIsDisplayTrip(true);
                                document.querySelector("#geocoder_from .mapboxgl-ctrl-geocoder--input").value = route.startName;
                                document.querySelector("#geocoder_to .mapboxgl-ctrl-geocoder--input").value = route.endName;
                                window.setFromFullAddr(`${route.startName},${route.startAddr}`);
                                window.setToFullAddr(`${route.endName},${route.endAddr}`);
                            }
                            if (window.profile_popup_open) {
                                window.close_profile_popup();
                            }
                        }} className="route-navigate-icon"/> 
                </div>
                <div className="route-favorite">
                    <FontAwesomeIcon icon={route.favorite ? faHeart : heartOutline} 
                        onClick={() => this.onFavorite(route._id, !route.favorite)} className="route-favorite-icon"
                        style={route.favorite ? {color: "#d64040"} : null} /> 
                </div>
                <div className="route-speed">
                    {this.calculateSpeed() + " mph"}
                </div>
                {this.props.expanded ? 
                    <div className="route-expanded-view">
                        <div className="route-expanded-header">
                            {route.isExerciseMode ? `Exercise Mode: ${route.startName}`
                                : `Trip Mode: ${route.startName} to ${route.endName}`}
                        </div>
                        <div className="route-expanded-description">
                            <i>Total Time:</i> {this.formatRuntime()} <br/>
                            <i>Total Distance:</i> {this.formatDistance()} <br/>
                            <i>Average Speed:</i> {this.calculateSpeed()} mph <br/>
                        </div>
                    </div>
                : ""}
            </div>
        )
    }
}

class DeletePopup extends Component {
      render() {
        const popupStyle = {
            "width": "350px",
            "borderRadius": "6px",
        };
        return (
            <Popup
              open={this.props.open}
              closeOnDocumentClick
              onClose={this.props.closePopup}
              contentStyle={popupStyle}
            >
                <div className="delete-popup">
                    <FontAwesomeIcon icon={faTimesCircle} className="deleteCircle" />
                    <h1>Are you sure?</h1>
                    <h2>
                        Once you delete a route, it cannot be recovered. The route will also be 
                        removed from your speed data.
                    </h2>
                    <button className="delete-confirm-button" onClick={() => {
                        window.deleteRoute(this.props.routeId);
                        this.props.closePopup();
                    }}>
                        Delete
                    </button>
                    <button className="delete-cancel-button" onClick={this.props.closePopup}>Cancel</button>
                </div>
            </Popup>
        );
      }
    }

export default HistoryScreen;