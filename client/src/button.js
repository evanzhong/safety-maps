import React, { Component } from 'react';
import { faMapPin, faMapMarkerAlt, faWalking, faBiking, faRunning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toggle from 'react-toggle'

import './button.scss';

class Button extends Component { 
    constructor(props) {
        super(props);
        this.state = {value: ''};
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit() {
        this.props.onClickCallback(this.state.value * 60); //Convert to seconds
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
        return (
            <div className="button-container">
                <input class="c-checkbox" type="checkbox" id="checkbox"/>
                <div class="c-formContainer">
                <form class="c-form" action="">
                    <input class="c-form__input" value={this.state.value} onChange={this.handleChange} placeholder="Time (min)" type="number" required/>
                    <label class="c-form__buttonLabel" for="checkbox" onClick={this.handleSubmit}>
                        <button class="c-form__button" type="button">Send</button>
                    </label>
                    <label class="c-form__toggle" for="checkbox" data-title="Save Route"></label>
                </form>
                </div>
            </div>
        )
    }
}

export default Button;