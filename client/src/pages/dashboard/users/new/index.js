import React from "react";
import {Alert, Btn, Paragraph, Field, FieldLabel, FieldHelper, Spinner} from "neutrine";
import {Checkbox, Label, Input} from "neutrine";
import {redirectHashbang as redirect} from "rouct";
import {request} from "@kofijs/request";

import * as auth from "../../../../commons/auth.js";
import * as notification from "../../../../commons/notification.js";

import Subhead from "../../../../components/subhead/index.js";

//New user component 
export default class NewUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false
        };
        this.ref = {
            "userName": React.createRef(),
            "userEmail": React.createRef(),
            "userPass1": React.createRef(),
            "userPass2": React.createRef(),
            "sendActivation": React.createRef()
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Handle submit form
    handleSubmit() {
        let self = this;
        //Get the new user data
        let data = {
            "name": this.ref.userName.current.value,
            "email": this.ref.userEmail.current.value,
            "pwd": this.ref.userPass1.current.value,
            "sendActivation": this.ref.sendActivation.current.checked
        };
        //Check for invalid email
        if (data.email.lenght === 0 || data.email.indexOf("@") === -1) {
            return notification.error("Invalid email provided");
        }
        //Check for invalid password
        if (data.pwd.length < 6) {
            return notification.error("Password must contain at least 6 characters");
        }
        //Check if passwords match
        if (data.pwd !== this.ref.userPass2.current.value) {
            return notification.error("Passwords do not match");
        }
        //Change the state to loading 
        return this.setState({"loading": true}, function () {
            //Request options 
            let requestOptions = {
                "url": "/api/users",
                "method": "post",
                "json": true,
                "body": data,
                "auth": auth.generateAuth()
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
                //Show confirmation and return to the users list
                notification.success("User registered");
                return setTimeout(function () {
                    return redirect("/dashboard/users");
                }, 500);
            });
        });
    }

    //Render the submit section
    renderSubmit() {
        if (this.state.loading === true) {
            return (<Spinner color="primary"/>);
        }
        else {
            return (<Btn color="primary" onClick={() => this.handleSubmit()}>Register user</Btn>);
        }
    }

    render() {
        if (this.props.isAdmin === false) {
            return (<Alert color="error">You must be an administrator to access this section</Alert>);
        }
        return (
            <div>
                <Subhead headerText="Register a new user"/>
                <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input type="text" fluid ref={this.ref.userName}/>
                </Field>
                <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input type="text" fluid ref={this.ref.userEmail}/>
                </Field>
                <Field>
                    <FieldLabel>Password</FieldLabel>
                    <Input type="password" fluid ref={this.ref.userPass1}/>
                    <FieldHelper>Password should contain 6 characters minimum.</FieldHelper>
                </Field>
                <Field>
                    <FieldLabel>Repeat password</FieldLabel>
                    <Input type="password" fluid ref={this.ref.userPass2}/>
                    <FieldHelper>Passwords must match</FieldHelper>
                </Field>
                <Field>
                    <Checkbox ref={this.ref.sendActivation}/>
                    <Label>Send activation email to this user</Label>
                    <FieldHelper>
                        If you activate that, the new user will receive a welcome email message that explains how to activate it's new account.
                    </FieldHelper>
                </Field>
                <Field>
                    {this.renderSubmit()}
                </Field>
            </div>
        );
    }
}

//New user component default props 
NewUser.defaultProps = {
    "isAdmin": false
};

