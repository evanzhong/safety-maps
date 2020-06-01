import React, { Component } from 'react';

class HistoryScreen extends Component {
    constructor(props) {
        super(props);
    }

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
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.history == null) {
            return "No route history";
        }
        return (
            <div className="route-list">
            {this.props.history.map((route) => 
                <RouteEntry route={route}/>
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