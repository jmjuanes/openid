import React from "react";
import {request} from "@kofijs/request";
import {Input, Btn, Small, Field, FieldLabel, FieldHelper, Spinner} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import * as notification from "../../commons/notification.js";

import "./styles.scss";

//Export reset component
export default class ResetPwdReset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false
        };
        this.ref = {
            "pwd1": React.createRef(),
            "pwd2": React.createRef()
        };
        //Bind methods 
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Submit the password change
    handleSubmit() {
        let self = this;
        let data = {
            "pwd": this.ref.pwd1.current.value.trim(),
            "id": this.props.request.params.id
        };
        //Check for invalid password
        if (data.pwd.length < 6) {
            return notification.error("Password should contain at least 6 charaters");
        }
        //Check if both passwords are equal
        if (data.pwd !== this.ref.pwd2.current.value) {
            return notification.error("Passwords do not match");
        }
        //Change to loading
        return this.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/resetpwd/" + data.id,
                "method": "post",
                "json": true,
                "body": data
            };
            //Do the request 
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"loading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                //Password changed!
                notification.success("Your password has been changed");
                return redirect("/login");
            });
        });
    }

    //Render the submit button
    renderSubmit() {
        if (this.state.loading === true) {
            return <Spinner color="primary"></Spinner>;
        }
        else {
            return <Btn color="primary" fluid onClick={this.handleSubmit}>Save password</Btn>
        }
    }

    render() {
        return (
            <div>
                <Small className="pf-resetpwd-subtitle" align="center">
                    Type here your new password.
                </Small>
                <Field>
                    <Input type="password" ref={this.ref.pwd1} fluid placeholder="New password"/>
                </Field>
                <Field>
                    <Input type="password" ref={this.ref.pwd2} fluid placeholder="Confirm new password"/>
                </Field>
                {this.renderSubmit()}
            </div>
        );
    }
}

