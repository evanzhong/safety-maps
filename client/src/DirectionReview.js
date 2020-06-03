import React, { Component } from 'react';

import './DirectionReview.css';

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