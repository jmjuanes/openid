import React from "react";
import {Btn, Field, FieldHelper, FieldLabel, Heading, Input} from 'neutrine';
import {request} from "neutrine-utils";

class Authorize extends React.Component {
    constructor(props) {
        super(props);
        // Check if the error
        let err = Object.keys(props.request.query).length === 0 ? "Invalid application id" : null;
        this.state = {
            app_name: props.app_name,
            error: err
        };
        this.ref = {
            emailInput: React.createRef(),
            pwdInput: React.createRef()
        };
        // Bind functions
        this.handleAuthorizeClick = this.handleAuthorizeClick.bind(this);
    }

    // Authorize
    handleAuthorizeClick() {
        let self = this;
        let credentials = {
            email: this.ref.emailInput.current.value,
            pwd: this.ref.pwdInput.current.value,
            client: this.props.request.query.id
        };
        // Check if the email is valid
        if (credentials.email.indexOf("@") === -1) {
            return this.setState({error: "Invalid email provided"});
        }
        // Check if the password is valid
        if (credentials.pwd.length < 6) {
            return this.setState({error: "Invalid password"});
        }
        // Check if the application id exists
        if (typeof credentials.client === "undefined" || credentials.client.length === 0) {
            return this.setState({error: "Invalid application id"});
        }

        // Do the request
        request({url: "/api/authorize", method: "post", json: true, body: credentials}, function (err, res, body) {
            if(err){
                return self.setState({error: err.message});
            }
            if(res.statusCode >= 300){
                return self.setState({error: body.message})
            }
            // return;
        })

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
                    <div className="g-recaptcha" data-sitekey={this.props.captcha_key}></div>
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
                               inputRef={this.ref.emailInput}
                               required/>
                        <FieldHelper>Please enter a valid email</FieldHelper>
                    </Field>
                    {/*Password input*/}
                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input className="authorize-input"
                               type={"password"}
                               inputRef={this.ref.pwdInput}
                               required/>
                    </Field>
                    {/*Captcha*/}
                    {this.renderCaptcha()}
                    {/*Notice*/}
                    <div className="authorize-privacy siimple-small" align="center">
                        Check if all the information is correct and click on <b>"Sign in"</b>
                    </div>
                    {/*Submit the information*/}
                    <Btn color={"blue"} onClick={this.handleAuthorizeClick} fluid>Authorize</Btn>
                </div>
            </div>
        );
    };
}

export default Authorize;