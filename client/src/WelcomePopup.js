import React, { Component } from 'react';
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./WelcomePopup.css"

class Welcome extends Component {
    render() {
        return (
        <div className="container">
                <FontAwesomeIcon icon={faTimesCircle} className="close-icon" onClick={this.props.closeContainer}/> 

                <h1>Sorry, it's ugly rn</h1>
                <button onClick={this.props.doNotShowWelcome}>Do Not Show Again</button>
                
        </div>
        )
    }
}

class WelcomePopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWelcome: null,
        }
    }

    componentWillReceiveProps(props) {
        // Not sure if it needs to guarantee that this runs only once
        this.setState({
            showWelcome: props.open,
        })
    }

    closeContainer = () => {
        this.setState({showWelcome: false})
        this.forceUpdate();
        console.log(this.state.showWelcome)
    }

    render() {
        return(
            <div>
                { this.state.showWelcome ? <Welcome closeContainer={this.closeContainer} doNotShowWelcome={this.props.doNotShowWelcome}/> : null }
            </div>
        )
    }
}

export default WelcomePopup;