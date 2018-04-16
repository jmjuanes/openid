import React from "react";
import {Heading,Alert, Field, FieldLabel, FieldHelper, Input, Btn} from "neutrine";
import {request} from "neutrine-utils";

import "./styles.scss";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null 
        };
        this.ref = {
            emailInput: React.createRef(),
            pwdInput: React.createRef()
        };

        //Bind methods 
        this.handleSignInClick = this.handleSignInClick.bind(this);
    }

    handleSignInClick() {
        let self = this;
        //console.log(this.ref.emailInput.current.value);
        //console.log(this.ref.pwdInput.current.value);
        let credentials = {
            email: "",
            pwd: ""
        };
        //Check for a valid email
        if (credentials.email.indexOf("@") === -1) {
            return this.setState({error: "Invalid email provided"});
        }
        //Check the password
        if (credentials.pwd.length < 6) {
            return this.setState({error: "Invalid password"});
        }
        //Do the request
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

    // Display the captcha
    renderCaptcha() {
        if (this.props.captcha) {
            return (
                <div className="login-captcha">
                    <label className="siimple-label">Are you human?</label><br/>
                    <div className="g-recaptcha" data-sitekey={this.props.captcha_key}> </div>
                </div>
            );
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
                    <Btn color={"green"} fluid> Create an account </Btn>
                </Field>
            );
        }
    }


    render() {
        return (
            <div className="login-content">
                {/*Title*/}
                <Heading type={"h2"} align="center">Sign in</Heading>
                <div align="center" className={"login-subtitle siimple-small"}>Sign in into your
                    <b>{this.props.openid_name}</b></div>
                {/*Form*/}
                <form id="login-form" method="POST" encType="application/x-www-form-urlencoded">
                    {/*Error message*/}
                    {this.renderError()}
                    {/*Email*/}
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input className="login-input"
                            ref={this.ref.emailInput}/>
                        <FieldHelper>Please enter a valid email</FieldHelper>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input className="login-input" 
                            ref={this.ref.pwdInput}
                            type={"password"} 
                            pattern={".{6,}"}
                            title={"6 characters minimum"} 
                            name={"pwd"}/>
                    </Field>
                    {/*Captcha*/}
                    {this.renderCaptcha()}
                    {/*Notice*/}
                    <div className="login-privacy siimple-small" align="center">
                        Check if all the information is correct and click on <b>"Sign in"</b>
                    </div>
                    {/*Sign in*/}
                    <Btn color={"blue"} fluid onClick={this.handleSignInClick}>Sign in</Btn>
                    {/*New account*/}
                    {this.renderRegisterField()}
                </form>
            </div>
        );
    }
}

export default Login;
