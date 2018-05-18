import React, {Component} from 'react';
import {
    Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Spinner, List, ListItem, Small,
    Paragraph
} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";
import * as notification from "../../../../commons/notification.js";

import "./styles.scss";

class CreateApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            done: null
        };
        this.ref = {
            nameInput: React.createRef(),
            detailInput: React.createRef(),
            redirectInput: React.createRef()
        };
        this.handleCreateApp = this.handleCreateApp.bind(this);
    }

    // Create a new application
    handleCreateApp() {
        let self = this;
        let info = {
            name: this.ref.nameInput.current.value,
            detail: this.ref.detailInput.current.value,
            redirect: this.ref.redirectInput.current.value
        };
        // Check that there aren't empty fields
        if (info.name.length === 0 || info.detail.length === 0 || info.redirect.length === 0) {
            return notification.warning("No field can be empty");
        }
        if (info.redirect.indexOf(".") === -1) {
            return notification.warning("Invalid URL");
        }

        request({
            url: "/api/applications",
            method: "post",
            json: true,
            body: info,
            auth: {bearer: localStorage.getItem("token")}
        }, function (err, res, body) {
            if (err) {
                return notification.error(err.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            // Reset the fields
            self.ref.nameInput.current.value = "";
            self.ref.detailInput.current.value = "";
            self.ref.redirectInput.current.value = "";
            return notification.success("Application successfully created");
        });
    }

    render() {
        if (!this.props.admin) {
            return (
                <Alert>You must be an administrator to access this route.</Alert>
            );
        }
        else
            return (
                <div className={"create-app-content"}>
                    {/*Title*/}
                    <Heading type={"h2"}>Create an application</Heading>
                    <Paragraph>Please check that all fields are correct before submitting.</Paragraph>
                    {/*Form to create an app*/}
                    <div className="create-app-form">
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Name of the application</FieldLabel>
                            <Input className="create-app-input"
                                   type={"text"}
                                   fluid
                                   ref={this.ref.nameInput}/>
                        </Field>
                        {/*Detail input*/}
                        <Field>
                            <FieldLabel>Detail of the application</FieldLabel>
                            <Input className="create-app-input"
                                   type={"text"}
                                   fluid
                                   ref={this.ref.detailInput}/>
                        </Field>
                        {/*Redirect input*/}
                        <Field>
                            <FieldLabel>Redirect URL</FieldLabel>
                            <Input className="create-app-input"
                                   type={"text"}
                                   fluid
                                   ref={this.ref.redirectInput}/>
                            <FieldHelper>Must be a valid URL</FieldHelper>
                        </Field>
                        <Btn color={"blue"} onClick={() => this.handleCreateApp()}>Create application</Btn>
                    </div>
                </div>
            );
    }
}

export default CreateApp;
