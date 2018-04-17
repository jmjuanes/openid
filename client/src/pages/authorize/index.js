import React from "react";
import {Btn, Field, FieldHelper, FieldLabel, Heading, Input} from 'neutrine';

class Authorize extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            app_name: props.app_name,
            error: null
        };
        this.ref = {
            emailInput: React.createRef(),
            pwdInput: React.createRef()
        };
    }

    // Display the error message
    renderError() {
        if (this.state.error) {
            return (
                <Alert color={"red"} className={"authorize-error"}>
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


    render() {
        return (
            <div className={"authorize-content"}>
                {/*Title*/}
                <Heading align={"center"} type={"h2"}>Authorize - {this.props.openid_name}</Heading>
                {/*Detail*/}
                <div className={"authorize-detail"} align={"center"}>{this.state.app_name} is requesting permission to
                    access your account information.
                </div>
                {/*Authorize form*/}
                <div className={"authorize-form"}>
                    {/*Error message*/}
                    {this.renderError()}
                    {/*Email input*/}
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input className="authorize-input"
                               required/>
                        <FieldHelper>Please enter a valid email</FieldHelper>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input className="authorize-input"
                               type={"password"}
                               required/>
                    </Field>
                    {/*Captcha*/}
                    {this.renderCaptcha()}
                    {/*Notice*/}
                    <div className="authorize-privacy siimple-small" align="center">
                        Check if all the information is correct and click on <b>"Sign in"</b>
                    </div>
                    {/*Submit the information*/}
                    <Btn color={"blue"} fluid>Authorize</Btn>
                </div>
            </div>
        );
    };
}

export default Authorize;