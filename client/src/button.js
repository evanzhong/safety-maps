import React, { Component } from 'react';
//import { faMapPin, faMapMarkerAlt, faWalking, faBiking, faRunning } from "@fortawesome/free-solid-svg-icons";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import Toggle from 'react-toggle'

import './button.scss';

class Button extends Component { 
    constructor(props) {
        super(props);
        this.state = {
            second: 0,
            minute: 0,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit() {
        console.log("asdf");
        let totalSeconds = parseInt(this.state.minute*60) + parseInt(this.state.second);
        this.props.onClickCallback(totalSeconds);
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }


    render() {
        return (
            <div className="button-container">
                <input className="c-checkbox" type="checkbox" id="checkbox"/>
                <div className="c-formContainer">
                <form className="c-form" action="">
                    <input className="c-form__input" name="minute" onChange={this.handleChange} placeholder="Min" type="number" min="0" required/>
                    <h1>:</h1>
                    <input className="c-form__input" name="second" onChange={this.handleChange} placeholder="Sec" type="number" min="0" max="60" required/>
                    <label className="c-form__buttonLabel" htmlFor="checkbox" onClick={this.handleSubmit}>
                        <button className="c-form__button" type="button">Send</button>
                    </label>
                    <label className="c-form__toggle" htmlFor="checkbox" data-title="Save Route"></label>
                </form>
                </div>
            </div>
        )
    }
}

export default Button;