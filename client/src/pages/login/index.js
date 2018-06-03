import React from "react";
import {Heading, Alert, Field, FieldLabel, FieldHelper, Input, Btn} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import * as notification from "../../commons/notification.js";
import Captcha from "../../components/captcha/index.js";

import "./styles.scss";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
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
        //Check the continue url
        if (typeof this.props.request.query.continueTo === "string") {
            redirectUrl = redirectUrl + "?continueTo=" + this.props.request.query.continueTo;
        }
        return redirect(redirectUrl);
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
        //Do the request
        let requestOptions = {
            "url": "/api/login",
            "method": "post",
            "json": true,
            "body": data
        };
        return request(requestObject, function (error, res, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            //return self.props.saveToken(body.token);
            //
        });
    }

    //Display the register link
    renderRegister() {
        if (this.props.openid_allow_signup) {
            return (
                <Field className="login-register">
                    <FieldLabel align="center">New to {this.props.openid_name}?</FieldLabel>
                    <Btn color="green" onClick={this.redirectToRegister} fluid>Create an account</Btn>
                </Field>
            );
        }
    }

    //Display the captcha
    renderCaptcha() {
        if (this.props.captcha_enabled === true) {
            return <Captcha sitekey={this.props.caltcha_key} onError={this.handleCaptchaError} ref={this.ref.captchaInput}/>;
        }
    }

    render() {
        return (
            <div className="login-content">
                {/*Title*/}
                <Heading type={"h2"} align="center">Sign in</Heading>
                <div align="center" className="login-subtitle siimple-small">
                    Sign in into your <strong>{this.props.openid_name}</strong> account
                </div>
                {/*Form*/}
                <div id="login-form">
                    {/*Email input*/}
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input className="login-input" ref={this.ref.emailInput} type="text"/>
                        <FieldHelper>Please enter a valid email</FieldHelper>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input className="login-input" ref={this.ref.pwdInput} type="password"/>
                    </Field>
                    {/*Captcha*/}
                    {this.renderCaptcha()}
                    {/*Notice*/}
                    <div className="login-privacy siimple-small" align="center">
                        Check that all the information is correct and click on <b>"Sign in"</b>
                    </div>
                    {/*Sign in*/}
                    <Btn color="blue" fluid onClick={this.handleSubmit}>Sign in</Btn>
                    {/*New account*/}
                    {this.renderRegister()}
                </div>
            </div>
        );
    }
}

