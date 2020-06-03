import React, { Component } from 'react';
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Logo from "./assets/logo.png";

import "./WelcomePopup.css"

class Welcome extends Component {
    render() {
        return (
        <div className="container">
            <img src={Logo} className="logo" alt="safety maps logo" /> 

            <FontAwesomeIcon icon={faTimesCircle} className="close-icon" onClick={this.props.closeContainer}/>
            <div className="text-container">
                <p>To encourage people to walk and exercise more, SafetyMaps will navigate you to your destination with the safest, most efficient route.     
                </p>
                <p>Toggle to trip or exercise depended on your goal. Leave the rest to us!
                </p> 
                <p>SafetyMaps is a quarter-long project by TopoPro, a collaboration between four apprentice engineers for Computer Science 97!
                </p>
            </div>
            <div className="do-not-show-again-container"> 
                <input type="radio" id="show" value="show" onChange={this.props.doNotShowWelcome}/>
                <label for="show">
                    Do Not Show This Again
                </label>
                {/* </input><button className="do-not-show-but" onClick={this.props.doNotShowWelcome}>Do Not Show Again</button> */}
            </div>    
        </div>
        )
    }
}

class WelcomePopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWelcome: null,
            count: 0,
        }
    }

    componentWillReceiveProps(props) {
        // Guarantee that this runs only once
        var count = this.state.count;
        if (count === 0)
        {
            count++;
            this.setState({
                showWelcome: props.open,
                count: count,
            })
        }
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