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
    openid_allow_signup: true,
    // error: "This is an error"
};

//Main app class
class App extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router.Switch>
                <Router.Route exact path="/" component={Login} props={defaultInfo}/>
            </Router.Switch>
        );
    }
}

//Load when dom is ready
ready(function () {
    //Mount the app component 
    ReactDOM.render(h(App, {}), document.getElementById("root"));
});

