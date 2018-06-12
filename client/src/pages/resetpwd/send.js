import React from "react";
import {request} from "@kofijs/request";
import {Alert, Input, Btn, Small, Spinner, Field} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import * as notification from "../../commons/notification.js";

import "./styles.scss";

//Send ResetPwd component
export default class ResetPwdSend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false
        };
        //Referenced elemente
        this.ref = {
            "email": React.createRef()
        };
        //Bind methods 
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Send the email to reset the password
    handleSubmit() {
        let self = this;
        let data = {
            "email": this.ref.email.current.value
        };
        //Check for empty or not valid email
        if (data.email.length === 0 || data.email.indexOf("@") === -1 || data.email.indexOf(".") === -1) {
            return notification.error("Invalid email provided");
        }
        //Change the state to loading
        return this.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/resetpwd",
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
                //Done!
                notification.success("We have sent you an email with the steps to reset your password");
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
            return <Btn color="primary" fluid onClick={this.handleSubmit}>Reset password</Btn>
        }
    }

    render() {
        return (
            <div>
                <Small className="pf-resetpwd-subtitle" align="center">
                    Enter your email address below and we'll send you a link to reset your password.
                </Small>
                <Field>
                    <Input type="text" ref={this.ref.email} fluid placeholder="Email address"/>
                </Field>
                {this.renderSubmit()}
            </div>
        );
    }
}
