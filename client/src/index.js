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

import * as auth from "./commons/auth.js";
import * as notification from "./commons/notification.js";

import "./styles.scss";

//Main app class
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "config": null
        };
    }

    // Get the general info, like the captcha sitekey
    componentDidMount() {
        let self = this;
        //Import configuration data
        return request({"url": "/api/", "json": true}, function (error, response, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (response.statusCode >= 300) {
                return notification.error(body.message);
            }
            //New configuration object
            let config = {
                "openid_name": body.openid_name,
                "captcha_enabled": body.captcha_enabled,
                "captcha_key": body.captcha_key,
                "openid_allow_signup": body.openid_allow_signup
            };
            return self.setState({"config": config});
        });
    }

    render() {
        //Check if the configuration has been imported
        if (this.state.config === null) {
            return <Spinner color="primary" style={{"marginTop": "75px"}}/>;
        } 
        else {
            //Save the configuration object
            let config = this.state.config;
            return (
                <Router.HashbangRouter>
                    <Router.Switch>
                        <Router.Route exact path="/login" component={Login} props={config}/>
                        <Router.Route exact path="/authorize" component={Authorize} props={config}/>
                        <Router.Route exact path="/register" component={Register} props={config}/>
                        <Router.Route path="/dashboard" component={Dashboard} props={config}/>
                        <Router.Route path="/" component={Login} props={config}/>
                    </Router.Switch>
                </Router.HashbangRouter>
            );
        }
    }
}


//Mount the app component
ReactDOM.render(React.createElement(Main, {}), document.getElementById("root"));

//Mount the notifications
notification.init();

