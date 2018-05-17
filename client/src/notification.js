import React from "react";
import ReactDOM from "react-dom"; 
import {Alert, Close} from "neutrine";

//Mounted notification element
let notification = null;

//Toast class
class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "color": "blue",
            "text": "Placeholder",
            "display": false,
        };
        this.timer = null;
        //Bind methods
        this.displayDone = this.displayDone.bind(this);
        this.displayWarning = this.displayWarning.bind(this);
        this.displayError = this.displayError.bind(this);
        this.close = this.close.bind(this);
    }

    close() {
        clearTimeout(this.timer);
        this.setState({ display: false});
    }

    display(color, text, time) {
        let self = this;
        //Check the time argument 
        if (typeof time !== "number") {
            time = 5000;
        }
        //Initialize the new state
        let newState = {
            "color": color,
            "text": text,
            "display": true
        };
        return this.setState(newState, function() {
            if (self.timer) {
                clearTimeout(self.timer);
            }
            if (self.state.time !== -1) {    
                self.timer = setTimeout(function () {
                    return self.close();
                }, time);
            }
        });
    }

    render() {
        let self = this;
        let close = React.createElement(Close, {onClick: self.close}, null);
        let alert = React.createElement(Alert, {color: self.state.color}, close, self.state.text);
        var myclass = [ 'toast' ];
        if (this.state.display === true) {
            myclass.push("toast--visible");
        }
        return React.createElement("div", {"className": myclass.join(" ")}, alert);
    }
}

//Initialize the notification
export function init () {
    let parent = document.getElementById("notification");
    notification = ReactDOM.render(React.createElement(Toast, {}, null), parent);
}

//Display an error alert
export function error (text, time) {
    return notification.display("error", text, time);
}

//Display a warning alert
export function warning (text, time) {
    return notification.display("warning", text, time);
}

//Display a success alert
export function success (text, time) {
    return notification.display("success", text, time);
}

