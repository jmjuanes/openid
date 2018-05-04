import React from "react";
import ReactDOM from "react-dom";
import {hyperscript as h, ready} from "neutrine-utils";
import {request} from "@kofijs/request";
import * as Router from "rouct";

import Login from "./pages/login/index.js";
import Authorize from "./pages/authorize/index.js";
import Register from "./pages/register/index.js";
import {Spinner} from "neutrine";
import Dashboard from "./pages/dashboard/index";

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
        return this.setState({token: token}, function () {
            return Router.redirectHashbang("/dashboard");
        });
    }

    // Delete the user token and return to the login
    deleteToken() {
        return this.setState({token: null}, function () {
            return Router.redirectHashbang("/login");
        });
    }

    render() {
        // Custom props for each route
        let loginProps = Object.assign({saveToken: this.saveToken}, this.state.config);
        let dashboardProps = Object.assign({token: this.state.token}, this.state.config);

        if (this.state.config === null) {
            return (
                <Spinner className={"authorize-loading"}/>
            );
        } else
            return (
                <Router.HashbangRouter>
                    <Router.Switch>
                        {/*Home route*/}
                        <Router.Route exact path="/login" component={Login} props={loginProps}/>
                        <Router.Route exact path="/authorize" component={Authorize} props={this.state.config}/>
                        <Router.Route exact path="/register" component={Register} props={this.state.config}/>
                        <Router.Route path="/dashboard" component={Dashboard} props={dashboardProps}/>
                    </Router.Switch>
                </Router.HashbangRouter>
            );
    }
}

//Load when dom is ready
ready(function () {
    //Mount the app component 
    ReactDOM.render(h(Main, {}), document.getElementById("root"));
});

