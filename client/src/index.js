import React from "react";
import ReactDOM from "react-dom";
import {hyperscript as h, ready} from "neutrine-utils";
import * as Router from "neutrine-router";

import Login from "./pages/login/index.js";

//General props
let defaultInfo = {
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
        let loginProps = Object.assign({saveToken: this.saveToken}, defaultInfo);
        return (
            <Router.Switch>
                <Router.Route exact path="/" component={Login} props={loginProps}/>
            </Router.Switch>
        );
    }
}

//Load when dom is ready
ready(function () {
    //Mount the app component 
    ReactDOM.render(h(App, {}), document.getElementById("root"));
});

