import React from "react";
import {Alert, Btn, Field, FieldLabel, Heading, Input} from "neutrine";

import './styles.scss';



class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null
        };
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

    render() {
        return (
            <div className={"register-content"}>
                {/*Title*/}
                <Heading type={"h2"} align="center">Register</Heading>
                {/*Subtitle*/}
                <div className={"register-subtitle siimple-small"} align={"center"}>
                    Fill the following fields to create a new <b>{this.props.openid_name}</b> account. All of them are required.
                </div>
                {/*Form*/}
                <div className={"register-form"}>
                    {/*Error*/}
                    {this.renderError()}
                    {/*Name input*/}
                    <Field>
                        <FieldLabel>Name</FieldLabel>
                        <Input className="register-input"
                            // inputRef={this.ref.nameInput}
                               required/>
                    </Field>
                    {/*Email input*/}
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input className="register-input"
                            // inputRef={this.ref.emailInput}
                               required/>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input className="register-input"
                            // inputRef={this.ref.pwdInput}
                               type={"password"}
                               required/>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Repeat password</FieldLabel>
                        <Input className="register-input"
                            // inputRef={this.ref.pwdRepeatInput}
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
                    <Btn color={"blue"} fluid>Create account</Btn>
                </div>
            </div>
        );
    };
}

export default Register;
