import React, { Component } from 'react';
import './ProfileSidebar.css';
import Popup from "reactjs-popup";

import { faUserCircle, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import HistoryScreen from "./HistoryScreen"

import './Global';

class ProfileSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            logged_in: false,
            first_name: null,
            last_name: null,
            email: null,
            history: null,
            fastestWalkSpeed: 0,
            fastestRunSpeed: 0,
            fastestBikeSpeed: 0,
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

    updateFavorite(routeId, fav) {
        var hist = this.state.history;
        hist.forEach(element => {
            if (element["_id"] === routeId) {
                element["favorite"] = fav;    
            }
        });
        this.setState({history: hist});
        fetch("http://localhost:8000/auth/secure/favorite_route?routeReq=" + JSON.stringify({route: routeId, favorite: fav}), {
            credentials: 'include'
        })
    }

    deleteRoute(routeId) {
        var hist = this.state.history;
        for (var i = 0; i < hist.length; ++i) {
            if (hist[i]["_id"] === routeId) {
                hist.splice(i, 1);
                this.setState({history: hist});
                break;
            }
        }
        fetch("http://localhost:8000/auth/secure/delete_route?removeId=" + routeId, {
            credentials: 'include'
        }).then(response => window.refreshSavedRoutes())
    }

    refreshSavedRoutes() {
        fetch("http://localhost:8000/auth/secure/account_info", {
            credentials: 'include'
        }).then((result) => {
                var login = result.status === 200 ? true : false;
                this.setState({
                    loading: false,
                    logged_in: login,
                });
                if (login) {
                    result.json().then((json) => {
                        this.setState({
                            first_name: json.userinfo.first_name,
                            last_name: json.userinfo.last_name,
                            email: json.userinfo.email,
                            history: json.history,
                        });

                        global.totwalkDist = 0;
                        global.totwalkTime = 0;
                        global.totrunDist = 0;
                        global.totrunTime = 0;
                        global.totbikeDist = 0;
                        global.totbikeTime = 0;

                        let fws = 0;
                        let frs = 0;
                        let fbs = 0;

                        this.state.history.forEach(element => {
                            let speed = element.distance * 3600 / element.runtime;

                            if (element.type === 'walk') {
                                global.totwalkDist += element.distance;
                                global.totwalkTime += (element.runtime / 60); //increment the global counter in miles per minute
                            }

                            if (element.type === 'run') {
                                global.totrunDist += element.distance;
                                global.totrunTime += (element.runtime / 60); //increment the global counter in miles per minute
                            }

                            if (element.type === 'bike') {
                                global.totbikeDist += element.distance;
                                global.totbikeTime += (element.runtime / 60);
                            }

                            if (element.type === 'walk' && speed > fws) {
                                fws = speed;
                            } else if (element.type === 'run' && speed > frs) {
                                frs = speed;
                            } else if (element.type === 'bike' && speed > fbs) {
                                fbs = speed;
                            }
                            this.setState({fastestWalkSpeed: fws, fastestRunSpeed: frs, fastestBikeSpeed: fbs});
                        });

                        /*
                        console.log("numwalks: " + global.numWalks);
                        console.log("numruns: " + global.numRuns);
                        console.log("numbikes: " + global.numBikes);
                        */

                        //checks for 
                        if (global.totwalkTime !== 0) {
                            global.avgwalkSpeed = global.totwalkDist / global.totwalkTime;
                        }
                        else {
                            global.avgwalkSpeed = 3.1/60.0; 
                        }
                        if (global.totrunTime !== 0) {
                            global.avgrunSpeed = global.totrunDist / global.totrunTime;
                        }
                        else {
                            global.avgrunSpeed = 6.12245/60.0;
                        }
                        if (global.totbikeTime !== 0) {
                            global.avgbikeSpeed = global.totbikeDist / global.totbikeTime;
                        }
                        else {
                            global.avgbikeSpeed = 12/60.0;
                        }
                        
                    })
                }
                return result;
            },
            // Handle error
            (error) => {
                console.error("Failed to connect to auth secure endpoint");
            }
        )
    }

    componentDidMount() {
        window.updateRouteFavorite = (routeId, fav) => this.updateFavorite(routeId, fav);
        window.deleteRoute = (routeId) => this.deleteRoute(routeId);
        window.isUserLoggedIn = () => {return this.state.logged_in};
        this.refreshSavedRoutes();
        window.refreshSavedRoutes = () => this.refreshSavedRoutes();
       /* this.refreshInterval = setInterval(() => {
            this.refreshSavedRoutes();
        }, 5000);*/
    }

    componentWillUnmount() {
       // clearInterval(this.refreshInterval);
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
                {this.state.logged_in ? <UserProfile user={user} history={this.state.history} fastestWalkSpeed={this.state.fastestWalkSpeed}
                    fastestRunSpeed={this.state.fastestRunSpeed} fastestBikeSpeed={this.state.fastestBikeSpeed} /> : <LoginPopup/> }
            </div>
        )
    }
}

// class UserProfile extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             isMainHidden: null,
//         }
//     }

//     componentDidMount(){
//         this.setState({
//             isMainHidden: false,
//         })
//     }
    
//     minimizeProfileMain(){
//         const mainDisplayCss = this.state.isMainHidden ? "display:none;" : "display:block;";
//         const wrapperDisplayCss = this.state.isMainHidden ? "width:300px;height:20px;" : "";
//         document.getElementById("user-profile-main").style = mainDisplayCss;
//         document.getElementById("user-profile-wrapper").style = wrapperDisplayCss;
//         this.setState({isMainHidden: !this.state.isMainHidden}); //Toggle with boolean flip
//     }

//     render() {
//         if(this.state.isMainHidden == null){ //wait for the user object to update
//             return null;
//         }
//         return (
//             <div id="user-profile-wrapper">
//                 <LogoutButton/>
//                 <div id="user-profile-mini-bar">
//                     <FontAwesomeIcon onClick={() => this.minimizeProfileMain()} icon={faBars} className="minbar-icon"/>
//                     {/* <button onClick={() => this.minimizeProfileMain()}>minimize</button> */}
//                 </div>
//                 <div id="user-profile-main">
//                     <h1>Welcome back{this.props.user.first_name ? " " + this.props.user.first_name : ""}!</h1>
//                     <HistoryPopup history={this.props.history}/>
//                     <p>Fastest run speed: 15 mph</p>
//                 </div>
                    
//             </div>
//         )
//     }
// }

class UserProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            opened: false,
        }

        window.close_profile_popup = () => this.toggleProfileScreen();
    }

    toggleProfileScreen() {
        window.profile_popup_open = !this.state.opened;
        this.setState({opened: !this.state.opened});
    }

    render() {
        return (
            <div className="new-user-profile-wrapper">
                <div className="new-user-profile-icon-wrapper">
                    <FontAwesomeIcon onClick={() => this.toggleProfileScreen()} icon={faBars} className="minbar-icon"/>
                </div>
                {this.props.user.first_name != null ?
                <div className="new-user-profile-main" style={this.state.opened ? {} : {display: "none"}}>
                    <div className="new-user-profile-header-wrapper">
                        <div className="new-user-initials-box">{this.props.user.first_name[0] + this.props.user.last_name[0]}</div>
                        <div className="new-user-username-box">
                            <div className="new-user-username-name">
                                {this.props.user.first_name + " " + this.props.user.last_name}
                            </div>
                            <div className="new-user-username-email">
                                {this.props.user.email}
                            </div>
                        </div>
                    </div>
                    <div className="new-user-profile-subheader-wrapper">
                        <HistoryPopup history={this.props.history} />
                        <p>Fastest walk speed: {this.props.fastestWalkSpeed === 0 ? "---" : Math.round(this.props.fastestWalkSpeed*10)/10 + " mph"}</p>
                        <p>Fastest run speed: {this.props.fastestRunSpeed === 0 ? "---" : Math.round(this.props.fastestRunSpeed*10)/10 + " mph"}</p>
                        <p>Fastest bike speed: {this.props.fastestBikeSpeed === 0 ? "---" : Math.round(this.props.fastestBikeSpeed*10)/10 + " mph"}</p>
                        <LogoutButton/>
                    </div>
                </div>
                : null}
            </div>
        );
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
        //return <FontAwesomeIcon onClick={this.logout} icon={faSignOutAlt} className="icon"/>;
        //<button className="login_button" onClick={this.logout}>Logout</button>
        return <button className="new-user-profile-logout-button" onClick={this.logout}>Sign Out</button>
    }
}

class HistoryPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            popup_open:false,
            fav_only: false,
        }
        this.openPopup = this.openPopup.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.openFavorites = this.openFavorites.bind(this);
    }

    openPopup() {
        this.setState({popup_open: true, fav_only: false});
    }
    closePopup() {
        this.setState({popup_open: false});
    }
    openFavorites() {
        this.setState({popup_open: true, fav_only: true});
    }

    render() {
        const popupStyle = {
            "width": "950px",
            "borderRadius": "6px",
        };
        return (
            <React.Fragment>
                <button className="profile-button" onClick={this.openPopup}>View Recent Routes</button>
                <button className="profile-button favorites" onClick={this.openFavorites}>Favorite Routes</button>
                <Popup
                    open={this.state.popup_open}
                    modal={true}
                    onClose={this.closePopup}
                    // trigger={open => (
                    //     <button className="profile-button">View Saved Routes</button>
                    // )}
                    closeOnDocumentClick
                    contentStyle={popupStyle}
                >
                    <HistoryScreen favoritesOnly={this.state.fav_only} closePopup={this.closePopup} history={this.props.history}/>
                </Popup>
            </React.Fragment>
        )
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
                    // <button className="login_button">Login</button>
                    // Icon Button
                    <FontAwesomeIcon icon={faUserCircle} className="icon"/>
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
                        //console.log(jsonResponse);
                        window.array.push(jsonResponse);
                        //console.log(jsonResponse["error"]);
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