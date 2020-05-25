import React, { Component } from 'react';

import './DirectionList.css';

class DirectionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div className="direction-list-wrapper">{this.props.coords == null ? "No Route" : "Route"}</div>
        )
    }
}

export default DirectionList;