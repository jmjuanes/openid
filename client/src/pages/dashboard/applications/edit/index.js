import React, {Component} from 'react';
import {request} from "@kofijs/request";
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Spinner} from "neutrine";

import "./styles.scss";

class EditApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            app: {},
            error: null,
            ready: false,
            done: null
        };
        this.ref = {
            nameInput: React.createRef(),
            detailInput: React.createRef(),
            redirectInput: React.createRef()
        };

        this.renderAlert = this.renderAlert.bind(this);
        this.updateApp = this.updateApp.bind(this);
    }

    componentWillMount() {
        let self = this;
        // Get the id from the params object of the request
        let url = "/api/applications/" + this.props.request.params.id;
        request({url: url, method: "get", json: true, auth: {bearer: this.props.token}}, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message, done: null});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message, done: null});
            }
            self.setState({
                app: {
                    name: body.name,
                    detail: body.detail,
                    redirect: body.redirect
                },
                ready: true
            });
        });
    }

    // Update the application info
    updateApp() {
        let self = this;
        let info = {
            name: this.ref.nameInput.current.value,
            detail: this.ref.detailInput.current.value,
            redirect: this.ref.redirectInput.current.value
        };
        // Check that all the info is new
        if (info.name === this.state.app.name && info.detail === this.state.app.detail && info.redirect === this.state.app.redirect) {
            return this.setState({error: "Change the app information before submitting", done: null});
        }
        // Check that there aren't empty fields
        if (info.name.length === 0 || info.detail.length === 0 || info.redirect.length === 0) {
            return this.setState({error: "No field can be empty", done: null});
        }

        let url = "/api/applications/" + this.props.request.params.id;
        request({
            url: url,
            method: "put",
            json: true,
            body: info,
            auth: {bearer: this.props.token}
        }, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message, done: null});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message, done: null});
            }
            // Set the new info
            return self.setState({
                app: {
                    name: body.name,
                    detail: body.detail,
                    redirect: body.redirect
                },
                done: "Application information successfully updated",
                error: null
            });
        });
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

    render() {
        if (!this.state.ready) {
            return (
                <Spinner/>
            );
        }
        else
            return (
                <div className={"edit-app-content"}>
                    {/*Title*/}
                    <Heading type={"h2"}>{this.state.app.name}</Heading>
                    {/*Edit form*/}
                    {/*Form title*/}
                    <Heading type={"h5"}>Edit the application information</Heading>
                    {/*Done/error message*/}
                    {this.renderAlert()}
                    <div className="edit-app-form">
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Application name</FieldLabel>
                            <Input className="edit-app-input"
                                   type={"text"}
                                   defaultValue={this.state.app.name}
                                   inputRef={this.ref.nameInput}/>
                        </Field>
                        {/*Detail input*/}
                        <Field>
                            <FieldLabel>Application detail</FieldLabel>
                            <Input className="edit-app-input"
                                   type={"text"}
                                   defaultValue={this.state.app.detail}
                                   inputRef={this.ref.detailInput}/>
                        </Field>
                        {/*Redirect input*/}
                        <Field>
                            <FieldLabel>Redirect URL</FieldLabel>
                            <Input className="edit-app-input"
                                   type={"text"}
                                   defaultValue={this.state.app.redirect}
                                   inputRef={this.ref.redirectInput}/>
                        </Field>
                        <Btn color={"blue"} onClick={() => {
                            this.updateApp();
                        }}>Update application</Btn>
                    </div>
                </div>
            );
    }
}

export default EditApp;
