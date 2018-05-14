import React, {Component} from 'react';
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Spinner, List, ListItem, Small} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

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
        this.renderAlert = this.renderAlert.bind(this);
    }

    // Render the alert if there's an error
    renderAlert() {
        if (this.state.error) {
            return (
                <Alert color={"red"}>{this.state.error}</Alert>
            );
        } else if (this.state.done) {
            return (
                <Alert color={"green"}>{this.state.done}</Alert>
            );
        }
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
            return this.setState({error: "No field can be empty", done: null});
        }
        if (info.redirect.indexOf(".") === -1) {
            return this.setState({error: "Invalid URL", done: null});
        }

        request({
            url: "/api/applications",
            method: "post",
            json: true,
            body: info,
            auth: {bearer: localStorage.getItem("token")}
        }, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message, done: null});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message, done: null});
            }
            // Reset the fields
            self.ref.nameInput.current.value = "";
            self.ref.detailInput.current.value = "";
            self.ref.redirectInput.current.value = "";
            return self.setState({error: null, done: "Application successfully created"});
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
                    <Small>Please check that all fields are correct before submitting.</Small>
                    {/*Form to create an app*/}
                    <div className="create-app-form">
                        {/*Alert*/}
                        {this.renderAlert()}
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Name of the application</FieldLabel>
                            <Input className="create-app-input"
                                   type={"text"}
                                   ref={this.ref.nameInput}/>
                        </Field>
                        {/*Detail input*/}
                        <Field>
                            <FieldLabel>Detail of the application</FieldLabel>
                            <Input className="create-app-input"
                                   type={"text"}
                                   ref={this.ref.detailInput}/>
                        </Field>
                        {/*Redirect input*/}
                        <Field>
                            <FieldLabel>Redirect URL</FieldLabel>
                            <Input className="create-app-input"
                                   type={"text"}
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
