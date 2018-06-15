import React from "react";
import ReactDOM from "react-dom";
import {request} from "@kofijs/request";
import {Footer, Link} from "neutrine";
import * as Router from "rouct";

import Login from "./pages/login/index.js";
import Authorize from "./pages/authorize/index.js";
import Register from "./pages/register/index.js";
import ResetPwd from "./pages/resetpwd/index.js";
import {Spinner} from "neutrine";
import Dashboard from "./pages/dashboard/index";

import * as auth from "./commons/auth.js";
import * as notification from "./commons/notification.js";

import "siimple/scss/_base.scss";
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
            return self.setState({"config": body});
        });
    }

    //Render the links used in the footer
    renderFooterLinks() {
        let self = this;
        let children = [];
        let counter = 0;
        this.state.config.footer.links.forEach(function (key) {
            let item = self.state.config.links[key];
            if (typeof item !== "undefined" && item !== null) {
                //Check if the children list is not empty to add the separator
                if (children.length > 0) {
                    children.push(React.createElement("div", {"key": counter, "className": "pf-footer-links-separator"}));
                    counter = counter + 1;
                }
                //Add the link
                let linkProps = {
                    "key": counter,
                    "className": "pf-footer-links-link",
                    "href": item.url,
                    "target": "_blank"
                };
                children.push(React.createElement(Link, linkProps, item.text));
                //Increment the links counter
                counter = counter + 1;
            }
        });
        //Check the number of links added
        if (children.length > 0) {
            return React.createElement("div", {"className": "pf-footer-links"}, children);
        }
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
                <div>
                    <Router.HashbangRouter>
                        <Router.Switch>
                            <Router.Route exact path="/login" component={Login} props={config}/>
                            <Router.Route exact path="/authorize" component={Authorize} props={config}/>
                            <Router.Route exact path="/register" component={Register} props={config}/>
                            <Router.Route path="/resetpwd" component={ResetPwd} props={config}/>
                            <Router.Route path="/dashboard" component={Dashboard} props={config}/>
                            <Router.Route path="/" component={Login} props={config}/>
                        </Router.Switch>
                    </Router.HashbangRouter>
                    <Footer size="medium" className="pf-footer" align="center">
                        {this.renderFooterLinks()}
                        <div className="pf-footer-logo"></div>
                        <div className="pf-footer-legal">
                            Powered by <strong>PassFort</strong>
                        </div>
                    </Footer>
                </div>
            );
        }
    }
}


//Mount the app component
ReactDOM.render(React.createElement(Main, {}), document.getElementById("root"));

//Mount the notifications
notification.init();

