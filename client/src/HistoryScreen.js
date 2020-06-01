import React, { Component } from 'react';

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
                <RouteEntry key={index} route={route}/>
            )}
            </div>
        );
    }
}

class RouteEntry extends Component {
    render() {
        const route = this.props.route;
        return (
            <div>
                {route.name}
            </div>
        )
    }
}

export default HistoryScreen;