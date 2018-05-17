import React from "react";
import {Alert, Close} from "neutrine";

//Toast class
class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "color": "blue",
            "text": "Placeholder",
            "time": 5000,
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
        let newState = {
            "color": color,
            "text": text,
            "time": time,
            "display": true
        };
        return this.setState(newState, function() {
            if (self.timer) {
                clearTimeout(self.timer);
            }
            if (self.state.time !== -1) {    
                self.timer = setTimeout(function () {
                    return self.close();
                }, self.state.time);
            }
        });
    }

    displayDone(text, time) {
        return this.display("green", text, time);
    }

    displayWarning(text, time) {
        return this.display("yellow", text, time);
    }

    displayError(text, time) {
        return this.display("red", text, time);
    }

    render() {
        let self = this;
        let close = React.createElement(Close, {onClick: self.close}, null);
        let alert = React.createElement(Alert, {color: self.state.color}, close, self.state.text);
        var myclass = [ 'mytoast' ];
        if (this.state.display === true) {
            myclass.push("up");
        }
        return React.createElement("div", {"className": myclass.join(" ")}, alert);
    }
}



