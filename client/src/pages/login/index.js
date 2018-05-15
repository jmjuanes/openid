import React from "react";
import {Heading, Alert, Field, FieldLabel, FieldHelper, Input, Btn} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import "./styles.scss";
import Captcha from "../../components/captcha/index.js";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null
        };
        this.ref = {
            emailInput: React.createRef(),
            pwdInput: React.createRef(),
            captchaInput: React.createRef()
        };

        //Bind methods 
        this.handleSignInClick = this.handleSignInClick.bind(this);
        this.captchaError = this.captchaError.bind(this);
        this.redirectLogin = this.redirectLogin.bind(this);
    }

    // Callback for the captcha in case of error
    captchaError() {
        return (
            <Alert color={"red"} className={"register-error"}>
                Captcha validation error
            </Alert>
        );
    }

    // Redirect to the login when register is successful
    redirectLogin() {
        return redirect("/register");
    }

    // Display the error message
    renderError() {
        if (this.state.error) {
            return (
                <Alert color={"red"} className={"login-error"}>
                    {this.state.error}
                </Alert>
            )
        }
    }

    // Display the register link
    renderRegisterField() {
        if (this.props.openid_allow_signup) {
            return (
                <Field className={"login-register"}>
                    <FieldLabel align="center">
                        New to {this.props.openid_name}?
                    </FieldLabel>
                    <Btn color={"green"} onClick={this.redirectLogin} fluid> Create an account</Btn>
                </Field>
            );
        }
    }


    // Try to login with the information provided
    handleSignInClick() {
        let self = this;

        // User login info
        let credentials = {
            email: this.ref.emailInput.current.value,
            pwd: this.ref.pwdInput.current.value
        };


        // If the captcha is enabled check it
        if (this.props.captcha_enabled) {
            credentials = Object.assign({recaptcha: this.ref.captchaInput.current.getResponse()}, credentials);
        }
        // Check for a valid email
        if (credentials.email.indexOf("@") === -1) {
            return this.setState({error: "Invalid email provided"});
        }
        // Check the password
        if (credentials.pwd.length < 6) {
            return this.setState({error: "Invalid password"});
        }

        // Do the request
        request({url: "/api/login", method: "post", json: true, body: credentials}, function (error, res, body) {
            if (error) {
                return self.setState({error: error.message});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message});
            }
            return self.props.saveToken(body.token);
        });
    }

    render() {
        return (
            <div className="login-content">
                {/*Title*/}
                <Heading type={"h2"} align="center">Sign in</Heading>
                <div align="center" className={"login-subtitle siimple-small"}>Sign in into your
                    <b> {this.props.openid_name}</b></div>
                {/*Form*/}
                <div id="login-form">
                    {/*Error message*/}
                    {this.renderError()}
                    {/*Email input*/}
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input className="login-input"
                               ref={this.ref.emailInput}
                               required/>
                        <FieldHelper>Please enter a valid email</FieldHelper>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input className="login-input"
                               ref={this.ref.pwdInput}
                               type={"password"}
                               required/>
                    </Field>
                    {/*Captcha*/}
                    {this.props.captcha_enabled ? (<Captcha sitekey={this.props.captcha_key}
                                                            onError={this.captchaError}
                                                            ref={this.ref.captchaInput}/>) : (null)}
                    {/*Notice*/}
                    <div className="login-privacy siimple-small" align="center">
                        Check that all the information is correct and click on <b>"Sign in"</b>
                    </div>
                    {/*Sign in*/}
                    <Btn color={"blue"} fluid onClick={this.handleSignInClick}>Sign in</Btn>
                    {/*New account*/}
                    {this.renderRegisterField()}
                </div>
            </div>
        );
    }
}

export default Login;
