import React from "react";
import {Spinner} from "neutrine";

//Check if recaptcha is ready 
let recpatchaReady = function () {
    return typeof window !== "undefined" && typeof window.grecaptcha !== "undefined";
};

//Export the captcha component
export default class Captcha extends React.Component {
    constructor(props) {
        super(props);
        //Initial state 
        this.state = {
            ready: recaptchaReady()
        };
        //Referenced elements
        this.ref = {
            "wrapper": React.createRef(),
            "captcha": null,
            "readyCheck": null
        };
        //Bind listeners
        this.handleResponse = this.handleResponse.bind(this);
        this.handleExpired = this.handleExpired.bind(this);
        this.handleError = this.handleError.bind(this);
        //Check if the recaptcha is not ready to use 
        if (this.state.ready === false) {
            let self = this;
            this.ref.readyCheck = setInterval(function () {
                //Check if recaptcha is ready
                let isReady = recaptchaReady();
                if (isReady === true) {
                    clearInterval(self.ref.readyCheck);
                    self.setState({ready: true});
                }
            }, 500);
        }
    }

    componentDidMount() {
        return this.renderCaptcha();
    }

    componentWillUnmount() {
        //Clear the ready check interval
        clearInterval(this.ref.readyCheck);
    }

    componentDidUpdate() {
        return this.renderCaptcha();
    }

    renderCaptcha() {
        let self = this;
        //Check if the captcha is ready
        if (this.state.ready === false) {
            //Render the captcha and save the captcha widget
            this.ref.captcha = grecaptcha.render(this.ref.wrapper.current, {
                "sitekey": self.props.sitekey,
                "theme": self.props.theme,
                "size": self.props.size,
                "tabindex": self.props.tabindex,
                "callback": self.handleResponse,
                "expired-callback": self.handleExpired,
                "error-callback": self.handleError
            });
        }
    }

    getResponse() {
        //Return the current response code
        return grecaptcha.getResponse(this.ref.captcha);
    }

    handleResponse(response) {
        //Check the response listener 
        if (typeof this.props.onResponse === "function") {
            return this.props.onResponse.call(null, response);
        }
    }

    handleExpired() {
        //Check the expired listener
        if (typeof this.props.onExpired === "function") {
            return this.props.onExpired.call(null);
        }
    }

    handleError() {
        //Check the error listener
        if (typeof this.props.onError === "function") {
            return this.props.onError.call(null);
        }
    }

    render() {
        let self = this;
        let children = null;
        //Check if the captcha is ready 
        if (this.state.ready === false) {
            children = React.createElement(Spinner, {color: "blue"});
        }
        //Return the captcha div wrapper
        return React.createElement("div", {ref: self.ref.wrapper, align: "center"}, children);
    }
}

//Captcha component default props
//https://developers.google.com/recaptcha/docs/display#render_param 
Captcha.defaultProps = {
    "sitekey": null,
    "size": "normal",
    "theme": "light",
    "tabindex": 0,
    "onResponse": null,
    "onExpired": null,
    "onError": null
};

