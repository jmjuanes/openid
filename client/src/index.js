import React from "react";
import ReactDOM from "react-dom";
import {hyperscript as h, ready} from "neutrine-utils";
import * as Router from "neutrine-router";

import Login from "./pages/login/index.js";
import Authorize from "./pages/authorize/index";

//General props
let defaultProps = {
    openid_name: "OPENID_NAME",
    captcha: false,
    captcha_key: 'nope',
    openid_allow_signup: true
};

//Main app class
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: null
        };
        this.saveToken = this.saveToken.bind(this);
        this.deleteToken = this.deleteToken.bind(this);
    }

    saveToken(token) {
        return this.setState({token: token}, function (){
            return Router.redirect("/dashboard");
        });
    }

    deleteToken() {
        return this.setState({token: null}, function () {
            return Router.redirect("/login");
        });
    }

    render() {
        // Custom props for each route
        let loginProps = Object.assign({saveToken: this.saveToken}, defaultProps);
        
        return (
            <Router.Switch>
                <Router.Route exact path="/login" component={Login} props={loginProps}/>
                <Router.Route exact path="/authorize" component={Authorize} props={defaultProps}/>
            </Router.Switch>
        );
    }
}

//Load when dom is ready
ready(function () {
    //Mount the app component 
    ReactDOM.render(h(App, {}), document.getElementById("root"));
});

