import React from "react";

//Export the captcha component
export default class Captcha extends React.Component {
    constructor(props) {
        super(props);
        //Referenced elements
        this.ref = {
            "wrapper": React.createRef(),
            "captcha": null
        };
        //Bind listeners
        this.handleResponse = this.handleResponse.bind(this);
        this.handleExpired = this.handleExpired.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    componentDidMount() {
        return this.renderCaptcha();
    }

    componentDidUpdate() {
        return this.renderCaptcha();
    }

    renderCaptcha() {
        let self = this;
        //Render the captcha and save the captcha widget
        this.ref.captcha = grecaptcha.render(this.ref.wrapper.current {
            "sitekey": self.props.sitekey,
            "theme": self.props.theme,
            "size": self.props.size,
            "tabindex": self.props.tabindex,
            "callback": self.handleResponse,
            "expired-callback": self.handleExpired,
            "error-callback": self.handleError
        });
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
        //Return the captcha div wrapper
        return React.createElement("div", {ref: self.ref.wrapper});
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

