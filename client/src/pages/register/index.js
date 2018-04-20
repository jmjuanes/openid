import React from "react";
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input} from "neutrine";
import {request} from "neutrine-utils";

import './styles.scss';


class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            done: false
        };
        this.ref = {
            nameInput: React.createRef(),
            emailInput: React.createRef(),
            pwdInput: React.createRef(),
            pwdRepeatInput: React.createRef()
        };
        //Bind functions
        this.handleRegisterClick = this.handleRegisterClick.bind(this);
    }

    // Display the error message
    renderError() {
        if (this.state.error) {
            return (
                <Alert color={"red"} className={"register-error"}>
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
                    <div className="g-recaptcha" data-sitekey={this.props.captcha_key}></div>
                </div>
            );
        }
    }

    // Register the user with the provided info
    handleRegisterClick() {
        let self = this;
        let credentials = {
            name: this.ref.nameInput.current.value,
            email: this.ref.emailInput.current.value,
            pwd: this.ref.pwdInput.current.value,
        };
        // Check if the email is valid
        if (credentials.email.indexOf("@") === -1) {
            return this.state.setState({error: "Invalid email provided"});
        }
        // Check if the password is valid
        if (credentials.pwd.length < 6) {
            return this.setState({error: "Invalid password"})
        }
        // Check if passwords match
        if (credentials.pwd !== this.ref.pwdRepeatInput.current.value) {
            return this.setState({error: "Passwords don't match"});
        }

        // Do the request
        request({url: "/api/users", method: "post", json: true, body: credentials},
            function (err, res, body) {
                if (err) {
                    self.setState({error: err.message});
                }
                if (res.statusCode >= 300) {
                    self.setState({error: body.message});
                }
                // Show the successful register view
                return self.setState({done: true});
            });
    }

    render() {
        if (this.state.done === true) {
            return (
                <div className="register-content register-success">
                    {/*Title*/}
                    <Heading type={"h2"} align={"center"}>You are done!</Heading>
                    <div className={"register-subtitle siimple-small"} align={"center"}>
                        Thanks for creating an account in <b>{this.props.openid_name}</b>. You can now continue with your signup:
                    </div>
                    <Btn color={"green"} fluid>Continue</Btn>
                </div>
            );
        }
        else {
            return (
                <div className={"register-content"}>
                    {/*Title*/}
                    <Heading type={"h2"} align="center">Register</Heading>
                    {/*Subtitle*/}
                    <div className={"register-subtitle siimple-small"} align={"center"}>
                        Fill the following fields to create a new <b>{this.props.openid_name}</b> account. All of them
                        are
                        required.
                    </div>
                    {/*Form*/}
                    <div className={"register-form"}>
                        {/*Error*/}
                        {this.renderError()}
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input className="register-input"
                                   inputRef={this.ref.nameInput}
                                   maxLength={"16"}
                                   required/>
                        </Field>
                        {/*Email input*/}
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input className="register-input"
                                   inputRef={this.ref.emailInput}
                                   required/>
                        </Field>
                        {/*Password input*/}
                        <Field>
                            <FieldLabel>Password</FieldLabel>
                            <Input className="register-input"
                                   inputRef={this.ref.pwdInput}
                                   type={"password"}
                                   required/>
                            <FieldHelper>6 characters minimum</FieldHelper>
                        </Field>
                        {/*Password input*/}
                        <Field>
                            <FieldLabel>Repeat password</FieldLabel>
                            <Input className="register-input"
                                   inputRef={this.ref.pwdRepeatInput}
                                   type={"password"}
                                   required/>
                        </Field>
                        {/*Captcha*/}
                        {this.renderCaptcha()}
                        {/*Notice*/}
                        <div className="register-privacy siimple-small" align="center">
                            Check that all the information is correct and click on <b>"Create account"</b>
                        </div>
                        {/*Register*/}
                        <Btn color={"blue"} onClick={this.handleRegisterClick} fluid>Create account</Btn>
                        {/*Login*/}
                        <Field className={"register-login"}>
                            <FieldLabel align="center">
                                Are you already registered?
                            </FieldLabel>
                            <Btn color={"green"} fluid> Log in </Btn>
                        </Field>
                    </div>
                </div>
            );
        }
    };
}

export default Register;
