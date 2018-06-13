import React from "react";
import {Btn, Field, FieldHelper, FieldLabel, Heading, Input, Small, Spinner} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import './styles.scss';

import Captcha from "../../components/captcha/index.js";

import * as notification from "../../commons/notification.js";

//Register screen class
export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "done": false,
            "loading": false
        };
        this.ref = {
            "nameInput": React.createRef(),
            "emailInput": React.createRef(),
            "pwd1Input": React.createRef(),
            "pwd2Input": React.createRef(),
            "captcha": React.createRef()
        };
        //Bind functions
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCaptchaError = this.handleCaptchaError.bind(this);
        this.redirectToLogin = this.redirectToLogin.bind(this);
    }

    //Callback for the captcha in case of error
    handleCaptchaError() {
        return notification.error("Captcha validation error");
    }

    // Register the user with the provided info
    handleSubmit() {
        let self = this;
        let data = {
            "name": this.ref.nameInput.current.value,
            "email": this.ref.emailInput.current.value,
            "pwd": this.ref.pwd1Input.current.value
        };
        //If the captcha is enabled check it
        if (this.props.captcha_enabled === true) {
            //data = Object.assign({recaptcha: this.ref.captcha.current.getResponse()}, data);
            data.recaptcha = this.ref.captcha.current.getResponse();
            if (typeof data.recaptcha !== "string" || data.recaptcha.length === 0) {
                return notification.error("Show that you are not a robot");
            }
        }
        //Check if the email is valid
        if (data.email.indexOf("@") === -1) {
            return notification.error("Invalid email provided");
        }
        //Check if the password is valid
        if (data.pwd.length < 6) {
            return notification.error("Password must contain at least 6 characters");
        }
        //Check if passwords match
        if (data.pwd !== this.ref.pwd2Input.current.value) {
            return notification.error("Passwords don't match");
        }
        //Change the state
        return this.setState({"loading": true}, function () {
            //Do the request
            let requestOptions = {
                "url": "/api/users",
                "method": "post",
                "json": true,
                "body": data
            };
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"loading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                //Show the successful register view
                return self.setState({"done": true, "loading": false});
            });
        });
    }

    //Perform a redirection
    redirectTo(redirectUrl) {
        //Check if is not loading 
        if (this.state.loading === false) {
            let query = this.props.request.query;
            //Check the continue url
            if (typeof query.continueTo === "string") {
                redirectUrl = redirectUrl + "?continueTo=" + window.encodeURIComponent(query.continueTo);
            }
            return redirect(redirectUrl);
        }
    }

    //Redirect to the login screen
    redirectToLogin() {
        return this.redirectTo("/login");
    }

    renderCaptcha() {
        if (this.props.captcha_enabled === true) {
            return <Captcha sitekey={this.props.captcha_key} onError={this.handleCaptchaError} ref={this.ref.captcha}/>;
        }
    }

    renderSubmit() {
        if (this.state.loading === true) {
            return <Spinner color="blue" className="pf-register-loading"/>;
        }
        else {
            return <Btn color="blue" onClick={this.handleSubmit} fluid>Create account</Btn>;
        }
    }

    render() {
        if (this.state.done === true) {
            return (
                <div className="pf-register-content pf-register-success">
                    <Heading type="h2" align="center">Register completed</Heading>
                    <Small className="pf-register-subtitle" align="center">
                        Thanks for creating an account in <b>{this.props.openid_name}</b>. You can now continue with your signup:
                    </Small>
                    <Btn color="green" onClick={this.redirectToLogin} fluid>Continue</Btn>
                </div>
            );
        }
        else {
            return (
                <div className="pf-register-content">
                    <Heading type="h2" align="center">Register</Heading>
                    <Small className="pf-register-subtitle" align="center">
                        Fill the following fields to create a new <b>{this.props.name}</b> account. All of them are required.
                    </Small>
                    <div>
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input ref={this.ref.nameInput} maxLength="16" type="text" fluid/>
                            <FieldHelper>
                                What should we call you?
                            </FieldHelper>
                        </Field>
                        {/*Email input*/}
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input ref={this.ref.emailInput} type="text" fluid/>
                            <FieldHelper>
                                We will never share your email address with anyone without your permission.
                            </FieldHelper>
                        </Field>
                        {/*Password input*/}
                        <Field>
                            <FieldLabel>Password</FieldLabel>
                            <Input ref={this.ref.pwd1Input} type="password" fluid/>
                            <FieldHelper>Your password should contain at least 6 characters.</FieldHelper>
                        </Field>
                        {/*Password input*/}
                        <Field>
                            <FieldLabel>Repeat password</FieldLabel>
                            <Input ref={this.ref.pwd2Input} type="password" fluid/>
                            <FieldHelper>
                                For security reasons please type again your password.
                            </FieldHelper>
                        </Field>
                        {/*Captcha*/}
                        {this.renderCaptcha()}
                        {/*Notice*/}
                        <Small className="pf-register-privacy" align="center">
                            Check that all the information is correct and click on <b>"Create account"</b>
                        </Small>
                        {/*Register*/}
                        {this.renderSubmit()}
                        {/*Login*/}
                        <Field className="pf-register-login">
                            <FieldLabel align="center">Are you already registered?</FieldLabel>
                            <Btn color="green" onClick={this.redirectToLogin} fluid>Log in</Btn>
                        </Field>
                    </div>
                </div>
            );
        }
    }
}

