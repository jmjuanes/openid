import React from "react";
import ReactDOM from "react-dom";
import {hyperscript as h, ready} from "neutrine-utils";
import * as Router from "neutrine-router";

//Main app class
class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return h("div", {}, "Hello world!");
    }
}

//Load when dom is ready
ready(function () {
    //Mount the app component 
    ReactDOM.render(h(App, {}), document.getElementById("root"));
});

