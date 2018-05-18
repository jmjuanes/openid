import React from "react";
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Paragraph, Spinner} from "neutrine";
import {request} from "@kofijs/request";

import * as notification from "../../../commons/notification.js";
import "./styles.scss";

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
        this.ref = {
            nameInput: React.createRef()
        };

        this.handleInfoChange = this.handleInfoChange.bind(this);
    }

    // Get the user info using his access token
    componentDidMount() {
        // Change to dashboard
        let self = this;

        request({url: "/api/user", method: "get", json: true, auth: {bearer: localStorage.getItem("token")}},
            function (err, res, body) {
                if (err) {
                    return notification.error(err.message);
                }
                if (res.statusCode >= 300) {
                    return notification.error(body.message);
                }
                return self.setState({
                    user: {
                        name: body.name,
                        email: body.email,
                        id: body.id
                    }
                });
            });
    }

    // Updates the user's information
    handleInfoChange() {
        let self = this;
        let credentials = {
            name: this.ref.nameInput.current.value
        };
        if (credentials.name === this.state.user.name) {
            return notification.warning("Change the info before submitting");
        }

        request({
            url: "/api/user",
            method: "put",
            json: true,
            body: credentials,
            auth: {bearer: localStorage.getItem("token")}
        }, function (err, res, body) {
            if (err) {
                return notification.error(body.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            notification.success("Information updated successfully");
            return self.setState({
                // React only respects the 1st level: update the whole user
                user: {
                    name: body.name,
                    id: self.state.user.id,
                    email: self.state.user.email
                }
            });
        });
    }


    render() {
        if (this.state.user === null) {
            return (
                <Spinner className={"profile-loading"}/>
            );
        } else
            return (
                <div className={"profile-content"}>
                    {/*Title*/}
                    <Heading type={"h2"}>Profile</Heading>
                    <Paragraph>This is your public user information.</Paragraph>
                    {/*User info*/}
                    <div className={"profile-form"}>
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input className="profile-input"
                                   type={"text"}
                                   fluid
                                   defaultValue={this.state.user.name}
                                   ref={this.ref.nameInput}/>
                        </Field>
                        {/*Email input*/}
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input className="profile-input"
                                   type={"text"}
                                   fluid
                                   defaultValue={this.state.user.email}
                                   readOnly/>
                            <FieldHelper>Email used to log in the application</FieldHelper>
                        </Field>
                    </div>
                    {/*Update info*/}
                    <Btn color={"blue"} onClick={this.handleInfoChange}>Update info</Btn>
                </div>
            );
    }
}

export default Profile;