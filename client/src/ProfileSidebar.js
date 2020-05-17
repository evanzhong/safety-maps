import React, { Component } from 'react';
import './ProfileSidebar.css';
import Popup from "reactjs-popup";

class ProfileSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            logged_in: false,
            first_name: null,
            last_name: null,
            email: null,
        }
    }

    loadLoginInfo() {
        var url = "http://localhost:8000/auth/secure/"
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onload = function() {

        };
        req.send();
    }

    componentDidMount() {
        fetch("http://localhost:8000/auth/secure/", {
            credentials: 'include'
        }).then(
                (result) => {
                    var login = result.status === 200 ? true : false;
                    this.setState({
                        loading: false,
                        logged_in: login,
                    });
                    console.log("Debug - Login info loaded");
                },
                // Handle error
                (error) => {
                    console.error("Failed to connect to auth secure endpoint");
                }
            )
    }

    render() {
        if (this.state.loading) {
            return null;
        } return (
            <div className="profile_sidebar_wrapper">
                {this.state.logged_in ? <LogoutButton/> : <LoginPopup/> }
            </div>
        )
    }
}

class LogoutButton extends Component {
    logout() {
        fetch("http://localhost:8000/auth/logout/", {
            credentials: 'include'
        }).then(
                (result) => {
                    console.log("Logged Out");
                    window.location.reload();
                },
                // Handle error
                (error) => {
                    console.error("Failed to connect to logout endpoint");
                }
            )
    }

    render() {
        return <button className="login_button" onClick={this.logout}>Logout</button>
    }
}

class LoginPopup extends Component {
    render() {
        const popupStyle = {
            "width": "350px",
            "borderRadius": "6px",
        };
        return (
            <Popup
                modal={true}
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

class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            loading: false,
            errorLogin: false
        }

        this.loginSubmit = this.loginSubmit.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.pwChange = this.pwChange.bind(this);
    }

    loginSubmit(event) {
        event.preventDefault();
        //validate parameters...
        this.setState({loading: true});
        fetch("http://localhost:8000/auth/login?email=" + this.state.email + "&password=" + this.state.password, {
            method: 'post',
            mode: 'cors',
            credentials: 'include',
            // headers: {'Content-Type': 'application/json'},
            // body: JSON.stringify({
            //     "email": this.state.email,
            //     "password": this.state.password
            // })
        }).then(
            (result) => {
                this.setState({
                    loading: false
                });
                if (result.status === 200) {
                    window.location.reload();
                    return null;
                }
                console.log("Incorrect login info");
                this.setState({
                    errorLogin: true
                });
            },
            // Handle error
            (error) => {
                console.error("Failed to connect to log in endpoint");
            }
        )
    }

    emailChange(event) {
        this.setState({email: event.target.value});
    }

    pwChange(event) {
        this.setState({password: event.target.value});
    }

    render() {
        var cursorLoading = {"cursor": "progress"};
        var cursorButton = {"cursor": "pointer"};
        if (this.state.errorLogin) {
            cursorButton = {
                "cursor": "pointer",
                "border": "2px solid red"
            }
        }
        var errorMsgDefault = {"display": "none"};
        var errorMsg = {"display": "initial"};

        return (
            <div className="login_popup">
                <h1>Login</h1>
                
                <form className="login_form" onSubmit={this.loginSubmit}>
                    <center>
                    <div className="login_prompt">
                        Email Address <br/>
                        <input className="login_form_input" type="text" name="email"
                            placeholder="Type your email address" autoComplete="off" 
                            value={this.state.email} onChange={this.emailChange} />
                    </div>
                    <div className="login_prompt">
                        Password <br/>
                        <input className="login_form_input" type="password" 
                            name="password" placeholder="Type your password" 
                            value={this.state.password} onChange={this.pwChange} />
                    </div>
                    <button className="login_form_submit" type="submit" style={this.state.loading ? cursorLoading : cursorButton}>
                        LOGIN
                    </button> <br/>
                    <span className="login_error_msg" style={this.state.errorLogin ? errorMsg : errorMsgDefault } >Incorrect email address or password</span>
                    <button className="login_form_switch_screen" onClick={this.props.switchScreen}>
                        Don't have an account? Sign up
                    </button>
                    </center>
                </form>
            </div>
        )
    }
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