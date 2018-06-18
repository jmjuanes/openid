import React from "react";
import {Input, Btn, Spinner, Field, FieldHelper, FieldLabel} from "neutrine";
import {request} from "@kofijs/request";

import * as auth from "../../../commons/auth.js";
import * as notification from "../../../commons/notification.js";

import Header from "../../../components/header/index.js";

//Export email management view
export default class Email extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "preferences": null,
            "loading": false
        };
        this.ref = {
            "email": React.createRef()
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Import email configuration
    componentDidMount() {
        let self = this;
        let requestOptions = {
            "url": "/api/user",
            "method": "get",
            "json": true,
            "auth": auth.generateAuth()
        };
        //Import email preferences
        return request(requestOptions, function (error, response, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (response.statusCode >= 300) {
                return notification.error(body.message);
            }
            //Save the email preferences
            let preferences = {
                "email": body.email
            };
            return self.setState({"preferences": preferences});
        });
    }

    //Handle email preferences submit
    handleSubmit() {
        let self = this;
        let data = {
            "email": this.ref.email.current.value.trim()
        };
        //Check for empty or invalid email
        if (data.email.length === 0 || data.email.indexOf("@") === -1 || data.email.indexOf(".") === -1) {
            return notification.error("Invalid email provided");
        }
        //Check the email value
        if (data.email === this.state.preferences.email) {
            return notification.success("Email preferences saved");
        }
        return self.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/user",
                "method": "put",
                "json": true,
                "body": data,
                "auth": auth.generateAuth()
            };
            //Update the email preferences
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"loading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                //Save the email references
                notification.success("Email preferences saved");
                return self.setState({"loading": false});
            });
        });
    }

    //Render the submit button
    renderSubmit() {
        if (this.state.loading === true) {
            return <Spinner color="primary"></Spinner>;
        }
        else {
            return <Btn color="blue" onClick={this.handleSubmit}>Save email preferences</Btn>;
        }
    }

    render() {
        if (this.state.preferences === null) {
            return <Spinner color="primary"></Spinner>;
        }
        else {
            let preferences = this.state.preferences;
            return (
                <div>
                    <Header text="Email"></Header>
                    <Field>
                        <FieldLabel>Your email</FieldLabel>
                        <Input type="text" defaultValue={preferences.email} fluid ref={this.ref.email}/>
                        <FieldHelper>
                            We will use your email only for account-related notifications.
                        </FieldHelper>
                    </Field>
                    {this.renderSubmit()}
                </div>
            );
        }
    }
}

