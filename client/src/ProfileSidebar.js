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
        } 
        const user = {
            "first_name": this.state.first_name,
            "last_name": this.state.last_name,
            "email": this.state.email,
        }
        return (
            <div className="profile_sidebar_wrapper">
                {this.state.logged_in ? <UserProfile user={user}/> : <LoginPopup/> }
            </div>
        )
    }
}

class UserProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            isMainHidden: null,
        }
    }

    componentDidMount(){
        this.setState({
            user: this.props.user,
            isMainHidden: false,
        })
    }
    
    minimizeProfileMain(){
        const mainDisplayCss = this.state.isMainHidden ? "display:none;" : "display:block;";
        const wrapperDisplayCss = this.state.isMainHidden ? "width:auto;margin-left:120px;margin-right:120px;" : "";
        document.getElementById("user-profile-main").style = mainDisplayCss;
        document.getElementById("user-profile-wrapper").style = wrapperDisplayCss;
        this.setState({isMainHidden: !this.state.isMainHidden}); //Toggle with boolean flip
    }

    render() {
        if(!this.state.user){ //wait for the user object to update
            return null;
        }
        return (
            <div id="user-profile-wrapper">
                <div id="user-profile-mini-bar">
                    <button onClick={() => this.minimizeProfileMain()}>minimize</button>
                </div>
                <div id="user-profile-main">
                    <h1>Welcome back{this.state.user.first_name ? " " + this.state.user.first_name : ""}!</h1>
                    <p>View Recent Routes</p>
                    <p>My Favorite Routes</p>
                    <p>Fastest time: </p>
                </div>
                    <LogoutButton/>
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
        this.passwordChange = this.passwordChange.bind(this);
    }

    loginSubmit(event) {
        event.preventDefault();
        //validate parameters...
        this.setState({loading: true});
        fetch("http://localhost:8000/auth/login", {
            method: 'post',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "email": this.state.email,
                "password": this.state.password
            })
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

    passwordChange(event) {
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
                            value={this.state.email} onChange={this.emailChange} required/>
                    </div>
                    <div className="login_prompt">
                        Password <br/>
                        <input className="login_form_input" type="password" 
                            name="password" placeholder="Type your password" 
                            value={this.state.password} onChange={this.passwordChange} required />
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

class RegisterScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirm_password: "",
            loading: false,
            errorRegister: false,
            errorMessage: "Error processing signup"
        }

        this.registerSubmit = this.registerSubmit.bind(this);
        this.emailChange = this.emailChange.bind(this);
        this.passwordChange = this.passwordChange.bind(this);
        this.confirmPassChange = this.confirmPassChange.bind(this);
        this.firstNameChange = this.firstNameChange.bind(this);
        this.lastNameChange = this.lastNameChange.bind(this);
        this.generateErrorMsg = this.generateErrorMsg.bind(this);
    }

    generateErrorMsg(msg) {
        this.setState({
            errorRegister: true,
            errorMessage: msg
        });
        console.log(msg);
    }

    registerSubmit(event) {
        event.preventDefault();
        //validate parameters... (still need to add more checks both here and backend)
        if (this.state.password !== this.state.confirm_password) {
            this.generateErrorMsg("Passwords don't match");
            return null;
        }
        this.setState({loading: true});
        fetch("http://localhost:8000/auth/signup", {
            method: 'post',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "email": this.state.email,
                "password": this.state.password,
                "first_name": this.state.first_name,
                "last_name": this.state.last_name
            })
        }).then(
            (result) => {
                this.setState({
                    loading: false
                });
                if (result.status === 200) {
                    //Success - perhaps add auto-login?
                    window.location.reload();
                    return null;
                }
                window.array = []
                var that = this;
                result.json().then(function(jsonResponse){
                    // users is now our actual variable parsed from the json, so we can use it
                    if ("error" in jsonResponse) {
                        var errMsg = jsonResponse["error"];
                        console.log(jsonResponse);
                        window.array.push(jsonResponse);
                        console.log(jsonResponse["error"]);
                        if (typeof errMsg === 'string' || errMsg instanceof String) {
                            that.generateErrorMsg(errMsg);
                            return null;
                        }
                        that.generateErrorMsg("Email address already in use.");
                        return null;
                    }
                  });
                //Shouldn't get here..
                this.generateErrorMsg("Unexpected error occurred.")
                return null;
            },
            // Handle error
            (error) => {
                console.error("Failed to connect to register endpoint");
            }
        )
    }

    emailChange(event) {
        this.setState({email: event.target.value});
    }

    passwordChange(event) {
        this.setState({password: event.target.value});
    }
    
    confirmPassChange(event) {
        this.setState({confirm_password: event.target.value});
    }

    firstNameChange(event) {
        this.setState({first_name: event.target.value});
    }

    lastNameChange(event) {
        this.setState({last_name: event.target.value});
    }

    render() {
        var cursorLoading = {"cursor": "progress"};
        var cursorButton = {"cursor": "pointer"};
        if (this.state.errorRegister) {
            cursorButton = {
                "cursor": "pointer",
                "border": "2px solid red"
            }
        }
        var errorMsgDefault = {"display": "none"};
        var errorMsg = {"display": "initial"};

        return (
            <div className="login_popup register">
                <h1>Register</h1>
                
                <form className="login_form" onSubmit={this.registerSubmit}>
                    <center>
                    <div className="login_prompt register">
                        Full Name <br/>
                        <input className="login_form_input register name first" type="text" name="first_name"
                            placeholder="First" autoComplete="off" 
                            value={this.state.first_name} onChange={this.firstNameChange} required />
                        <input className="login_form_input register name" type="text" name="last_name"
                            placeholder="Last" autoComplete="off" 
                            value={this.state.last_name} onChange={this.lastNameChange} required />
                    </div>
                    <div className="login_prompt register">
                        Email Address <br/>
                        <input className="login_form_input register" type="text" name="email"
                            placeholder="Type your email address" autoComplete="off" 
                            value={this.state.email} onChange={this.emailChange} required />
                    </div>
                    <div className="login_prompt register">
                        Password <br/>
                        <input className="login_form_input register" type="password" 
                            name="password" placeholder="Type your password" 
                            value={this.state.password} onChange={this.passwordChange} required />
                    </div>
                    <div className="login_prompt register">
                        Confirm Password <br/>
                        <input className="login_form_input register" type="password" 
                            name="confirm_password" placeholder="Confirm your password" 
                            value={this.state.confirm_password} onChange={this.confirmPassChange} required />
                    </div>
                    <button className="login_form_submit" type="submit" style={this.state.loading ? cursorLoading : cursorButton}>
                        Register
                    </button> <br/>
                    <span className="login_error_msg" style={this.state.errorRegister ? errorMsg : errorMsgDefault } >{this.state.errorMessage}</span><br/>
                    <button className="login_form_switch_screen" onClick={this.props.switchScreen}>
                        Already have an account? Log in
                    </button>
                    </center>
                </form>
            </div>
        )
    }
}

export default ProfileSidebar;