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
        this.redirectToResetPwd = this.redirectToResetPwd.bind(this);
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
                redirectUrl = redirectUrl + "?continueTo=" + query.continueTo;
            }
            return redirect(redirectUrl);
        }
    }

    //Redirect to the register screen
    redirectToRegister() {
        return this.redirectTo("/register");
    }

    //Redirect to the reset password screen
    redirectToResetPwd() {
        return this.redirectTo("/password");
    }

    //Try to login with the information provided
    handleSubmit() {
        let self = this;
        let data = {
            "email": this.ref.emailInput.current.value,
            "pwd": this.ref.pwdInput.current.value
        };
        //If the captcha is enabled get the response code 
        if (this.props.captcha_enabled) {
            //credentials = Object.assign({recaptcha: this.ref.captcha.current.getResponse()}, credentials);
            data.recaptcha = this.ref.captcha.getResponse();
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
        if (this.props.openid_allow_signup) {
            return (
                <Field className="pf-login-register">
                    <FieldLabel align="center">New to {this.props.openid_name}?</FieldLabel>
                    <Btn color="success" onClick={this.redirectToRegister} fluid>Create an account</Btn>
                </Field>
            );
        }
    }

    //Display the captcha
    renderCaptcha() {
        if (this.props.captcha_enabled === true) {
            return <Captcha sitekey={this.props.caltcha_key} onError={this.handleCaptchaError} ref={this.ref.captcha}/>;
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

    render() {
        return (
            <div className="pf-login-content">
                <Heading type="h2" align="center">Sign in</Heading>
                <Small align="center" className="pf-login-subtitle">
                    Sign in into your <strong>{this.props.openid_name}</strong> account
                </Small>
                <div>
                    {/*Email input*/}
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input ref={this.ref.emailInput} type="text" fluid/>
                        <FieldHelper>Please enter a valid email</FieldHelper>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input ref={this.ref.pwdInput} type="password" fluid/>
                    </Field>
                    {this.renderCaptcha()}
                    <Small className="pf-login-privacy" align="center">
                        Check that all the information is correct and click on <b>"Sign in"</b>
                    </Small>
                    {this.renderSubmit()}
                    {this.renderRegister()}
                </div>
            </div>
        );
    }
}

