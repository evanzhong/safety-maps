import React, { Component } from 'react';
import './ProfileSidebar.css';
import Popup from "reactjs-popup";

class ProfileSidebar extends Component {
  render() {
      return (
        <div className="profile_sidebar_wrapper">
            <LoginPopup/>
        </div>
      )
  }
}

class LoginPopup extends Component {
    render() {
        const popupStyle = {
            "width": "350px",
            "border-radius": "6px",
        };

        return (
            <Popup
                modal="true"
                trigger={open => (
                    <button className="login_button">Login</button>
                )}
                closeOnDocumentClick
                contentStyle={popupStyle}
            >
                <LoginRegisterScreen/>
            </Popup>
        )
    }
}

class LoginRegisterScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            login: true,
        };
    }

    switchScreen() {
        this.setState({login: !this.state.login});
    }

    render() {
        if (this.state.login) {
            return <LoginScreen switchScreen={() => this.switchScreen()}/>;
        } else {
            return <RegisterScreen switchScreen={() => this.switchScreen()}/>;
        }
    }
}

function LoginScreen(props) {
    return (
        <div className="login_popup">
            <h1>Login</h1>
            
            <form className="login_form">
                <center>
                <div className="login_prompt">
                    Email Address <br/>
                    <input className="login_form_input" type="text" name="email"
                        placeholder="Type your email address" autoComplete="off"/>
                </div>
                <div className="login_prompt">
                    Password <br/>
                    <input className="login_form_input" type="password" 
                        name="password" placeholder="Type your password"/>
                </div>
                <button className="login_form_submit" type="submit">
                    LOGIN
                </button> <br/>
                <button className="login_form_switch_screen" onClick={props.switchScreen}>
                    Don't have an account? Sign up
                </button>
                </center>
            </form>
        </div>
    )
}

function RegisterScreen(props) {
    return (
        <div className="login_popup register">
            <h1>Register</h1>
            
            <form className="login_form">
                <center>
                <div className="login_prompt register">
                    Full Name <br/>
                    <input className="login_form_input register name first" type="text" name="first_name"
                        placeholder="First" autoComplete="off"/>
                    <input className="login_form_input register name" type="text" name="last_name"
                        placeholder="Last" autoComplete="off"/>
                </div>
                <div className="login_prompt register">
                    Email Address <br/>
                    <input className="login_form_input register" type="text" name="email"
                        placeholder="Type your email address" autoComplete="off"/>
                </div>
                <div className="login_prompt register">
                    Password <br/>
                    <input className="login_form_input register" type="password" 
                        name="password" placeholder="Type your password"/>
                </div>
                <div className="login_prompt register">
                    Confirm Password <br/>
                    <input className="login_form_input register" type="password" 
                        name="confirm_password" placeholder="Confirm your password"/>
                </div>
                <button className="login_form_submit" type="submit">
                    Register
                </button> <br/>
                <button className="login_form_switch_screen" onClick={props.switchScreen}>
                    Already have an account? Log in
                </button>
                </center>
            </form>
        </div>
    )
}

export default ProfileSidebar;