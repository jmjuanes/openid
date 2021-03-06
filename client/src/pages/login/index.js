import React from "react";
import {Heading, Field, FieldLabel, FieldHelper, Input, Btn, Small, Spinner} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import * as auth from "../../commons/auth.js";
import * as notification from "../../commons/notification.js";
import Captcha from "../../components/captcha/index.js";

import "./styles.scss";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false
        };
        this.ref = {
            "emailInput": React.createRef(),
            "pwdInput": React.createRef(),
            "captcha": React.createRef()
        };
        //Bind methods 
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCaptchaError = this.handleCaptchaError.bind(this);
        this.redirectToRegister = this.redirectToRegister.bind(this);
        this.redirectToResetpwd = this.redirectToResetpwd.bind(this);
    }

    //Callback for the captcha in case of error
    handleCaptchaError() {
        return notification.error("Captcha validation error");
    }

    //Redirect to the provided url
    redirectTo(redirectUrl) {
        if (this.state.loading === false) {
            //Check the continue url
            let query = this.props.request.query;
            if (typeof query.continueTo === "string") {
                redirectUrl = redirectUrl + "?continueTo=" + window.encodeURIComponent(query.continueTo);
            }
            return redirect(redirectUrl);
        }
    }

    //Redirect to the register screen
    redirectToRegister() {
        return this.redirectTo("/register");
    }

    //Redirect to the reset password screen
    redirectToResetpwd() {
        return this.redirectTo("/resetpwd");
    }

    //Try to login with the information provided
    handleSubmit() {
        let self = this;
        let data = {
            "email": this.ref.emailInput.current.value,
            "pwd": this.ref.pwdInput.current.value
        };
        //If the captcha is enabled get the response code 
        if (this.props.captcha.enabled) {
            //credentials = Object.assign({recaptcha: this.ref.captcha.current.getResponse()}, credentials);
            data.recaptcha = this.ref.captcha.current.getResponse();
            if (typeof data.recaptcha !== "string" || data.recaptcha.length === 0) {
                return notification.error("Show that you are not a robot");
            }
        }
        //Check for a valid email
        if (data.email.length === 0 || data.email.indexOf("@") === -1) {
            return notification.error("Invalid email provided");
        }
        // Check the password
        if (data.pwd.length < 6) {
            return notification.error("Password must contain at least 6 characters");
        }
        return this.setState({"loading": true}, function () {
            //Do the request
            let requestOptions = {
                "url": "/api/login",
                "method": "post",
                "json": true,
                "body": data
            };
            return request(requestOptions, function (error, res, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"loading": false});
                }
                if (res.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                //return self.props.saveToken(body.token);
                //console.log(body);
                return self.setState({"loading": false}, function () {
                    //Save the token and redirect
                    auth.saveToken(body.token);
                    let query = self.props.request.query;
                    if (typeof query.continueTo === "string") {
                        //Redirect to the continue url 
                        let url = window.decodeURIComponent(query.continueTo);
                        //console.log("Redirect to: " + url);
                        return redirect(url);
                    }
                    else {
                        //Redirect to the dashboard
                        return redirect("/dashboard"); 
                    }
                });
            });
        });
    }

    //Display the register link
    renderRegister() {
        if (this.props.signup.enabled === true) {
            return (
                <Field className="pf-login-register">
                    <FieldLabel align="center">New to {this.props.name}?</FieldLabel>
                    <Btn color="success" onClick={this.redirectToRegister} fluid>Create an account</Btn>
                </Field>
            );
        }
    }

    //Display the captcha
    renderCaptcha() {
        if (this.props.captcha.enabled === true) {
            return <Captcha sitekey={this.props.captcha.key} onError={this.handleCaptchaError} ref={this.ref.captcha}/>;
        }
    }

    //Render the submit button
    renderSubmit() {
        if (this.state.loading === true) {
            return <Spinner color="primary"/>;
        }
        else {
            return <Btn color="primary" fluid onClick={this.handleSubmit}>Sign in</Btn>;
        }
    }

    //Render the reset password link
    renderResetpwd() {
        if (this.props.resetpwd.enabled === true) {
            return (
                <Small className="pf-login-resetpwd" align="center" onClick={this.redirectToResetpwd}>
                    Forgot your password?
                </Small>
            );
        }
    }

    render() {
        return (
            <div className="pf-login-content">
                <Heading type="h2" align="center">Sign in</Heading>
                <Small align="center" className="pf-login-subtitle">
                    Sign in into your <strong>{this.props.name}</strong> account
                </Small>
                <div>
                    {/*Email input*/}
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input ref={this.ref.emailInput} type="text" fluid/>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input ref={this.ref.pwdInput} type="password" fluid/>
                    </Field>
                    {this.renderCaptcha()}
                    {this.renderSubmit()}
                    {this.renderResetpwd()}
                    {this.renderRegister()}
                </div>
            </div>
        );
    }
}

