import React from "react";
import ReactDOM from "react-dom";
import {request} from "@kofijs/request";
import * as Router from "rouct";
import "siimple/scss/_base.scss";

import Login from "./pages/login/index.js";
import Authorize from "./pages/authorize/index.js";
import Register from "./pages/register/index.js";
import {Spinner} from "neutrine";
import Dashboard from "./pages/dashboard/index";

import * as notification from "./notification.js";

import "./styles.scss";


//Main app class
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: null,
            config: {},
            error: null
        };
        // Bind functions
        this.saveToken = this.saveToken.bind(this);
        this.deleteToken = this.deleteToken.bind(this);
    }

    // Get the general info, like the captcha sitekey
    componentDidMount() {
        let self = this;
        request({url: "/api/", method: "get", json: true}, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message});
            }
            return self.setState({
                config: {
                    openid_name: body.openid_name,
                    captcha_enabled: body.captcha_enabled,
                    captcha_key: body.captcha_key,
                    openid_allow_signup: body.openid_allow_signup
                }
            });
        });
    }

    // Save the user token from the login
    saveToken(token) {
        // Save the token in local storage
        localStorage.setItem("token", token);
        // Redirect
        return this.setState({token: token}, function () {
            return Router.redirectHashbang("/dashboard");
        });
    }

    // Delete the user token and return to the login
    deleteToken() {
        // Remove the token from the local storage
        localStorage.removeItem("token");
        // Redirect
        return this.setState({token: null}, function () {
            return Router.redirectHashbang("/login");
        });
    }

    render() {
        // Custom props for each route
        let loginProps = Object.assign({saveToken: this.saveToken}, this.state.config);
        let dashboardProps = Object.assign({token: this.state.token, deleteToken: this.deleteToken}, this.state.config);

        if (this.state.config === null) {
            return (
                <Spinner className={"authorize-loading"}/>
            );
        } else
            return (
                <Router.HashbangRouter>
                    <Router.Switch>
                        {/*Login route*/}
                        <Router.Route exact path="/login" component={Login} props={loginProps}/>
                        {/*Authorize route*/}
                        <Router.Route exact path="/authorize" component={Authorize} props={this.state.config}/>
                        {/*Register route*/}
                        <Router.Route exact path="/register" component={Register} props={this.state.config}/>
                        {/*Dashboard route*/}
                        <Router.Route path="/dashboard" component={Dashboard} props={dashboardProps}/>
                        {/*Default route*/}
                        <Router.Route path="/" component={Login} props={loginProps}/>
                    </Router.Switch>
                </Router.HashbangRouter>
            );
    }
}


//Mount the app component
ReactDOM.render(React.createElement(Main, {}), document.getElementById("root"));

//Mount the notifications
notification.init();

