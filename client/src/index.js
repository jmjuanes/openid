import React from "react";
import ReactDOM from "react-dom";
import {hyperscript as h, ready, request} from "neutrine-utils";
import * as Router from "neutrine-router";

import Login from "./pages/login/index.js";
import Authorize from "./pages/authorize/index.js";
import Register from "./pages/register/index.js";
import {Spinner} from "neutrine";


//Main app class
class App extends React.Component {
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
            console.log("Correct login. You'd be redirected to dashboard if it was implemented.")
            // return Router.redirect("/dashboard");
        });
    }

    // Delete the user token and return to the login
    deleteToken() {
        return this.setState({token: null}, function () {
            return Router.redirect("/login");
        });
    }

    render() {
        // Custom props for each route
        let loginProps = Object.assign({saveToken: this.saveToken}, this.state.config);

        if (this.state.config === null) {
            return (
                <Spinner className={"authorize-loading"}/>
            );
        } else
            return (
                <Router.Switch>
                    <Router.Route exact path="/login" component={Login} props={loginProps}/>
                    <Router.Route exact path="/authorize" component={Authorize} props={this.state.config}/>
                    <Router.Route exact path="/register" component={Register} props={this.state.config}/>
                </Router.Switch>
            );
    }
}

//Load when dom is ready
ready(function () {
    //Mount the app component 
    ReactDOM.render(h(App, {}), document.getElementById("root"));
});

