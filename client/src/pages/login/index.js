import React from "react";

import {Heading,Alert, Field, FieldLabel, FieldHelper, Input, Btn} from "neutrine";
import "./styles.scss";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: props.error
        }
    }

    // Display the error message
    renderError() {
        if (this.props.error) {
            return (
                <Alert color={"red"} className={"login-error"}>
                    {this.props.error}
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
                        <Input className="login-input"/>
                        <FieldHelper>Please enter a valid email</FieldHelper>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input className="login-input" type={"password"} pattern={".{6,}"}
                               title={"6 characters minimum"} name={"pwd"}/>
                    </Field>
                    {/*Captcha*/}
                    {this.renderCaptcha()}
                    {/*Notice*/}
                    <div className="login-privacy siimple-small" align="center">
                        Check if all the information is correct and click on <b>"Sign in"</b>
                    </div>
                    {/*Sign in*/}
                    <Btn color={"blue"} fluid>Sign in</Btn>
                    {/*New account*/}
                    {this.renderRegisterField()}
                </form>
            </div>
        );
    }
}

export default Login;
