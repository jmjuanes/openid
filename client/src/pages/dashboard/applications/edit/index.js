import React, {Component} from 'react';
import {request} from "@kofijs/request";
import {Alert, Btn, Field, FieldLabel, Heading, Input, Small, Spinner} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import "./styles.scss";

class EditApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            app: {},
            error: null,
            ready: false,
            done: null,
            modal: {
                show: false,
                error: null,
                disableBtn: false
            }
        };
        this.ref = {
            nameInput: React.createRef(),
            detailInput: React.createRef(),
            redirectInput: React.createRef(),
            modalConfirm: React.createRef()
        };
        this.text_confirm = "Yes, delete this app";

        this.renderAlert = this.renderAlert.bind(this);
        this.updateApp = this.updateApp.bind(this);

        // Functions from the modal
        this.showModal = this.showModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.renderErrorModal = this.renderErrorModal.bind(this);
        this.spinnerButton = this.spinnerButton.bind(this);
        this.handleAppDelete = this.handleAppDelete.bind(this);
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
                    id: self.props.request.params.id,
                    name: body.name,
                    detail: body.detail,
                    redirect: body.redirect
                },
                ready: true
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

    // Display the modal error message
    renderErrorModal() {
        if (this.state.modal.error) {
            return (
                <Alert color={"red"} className={"modal-error"}>
                    {this.state.modal.error}
                </Alert>
            )
        }
    }

    // Show or hide the modal
    showModal() {
        this.setState({
            modal: {
                show: !this.state.modal.show,
                error: null,
                disableBtn: false
            }
        });
    }

    // Render the delete button/spinner inside the modal
    spinnerButton() {
        if (!this.state.modal.disableBtn) {
            return (
                <Btn color={"red"} onClick={() => this.handleAppDelete()}>Delete the application</Btn>
            );
        } else {
            return (
                <Spinner/>
            );
        }
    }

    // Delete the app
    handleAppDelete() {
        let self = this;

        // Block the button meanwhile
        this.setState({modal: {error: null, show: true, disableBtn: true}});
        // Check text before calling the api
        if(this.ref.modalConfirm.current.value !== this.text_confirm){
            return this.setState({modal: {error: "Please type the exact confirmation text", show: true, disableBtn: false}});
        }

        let url = "/api/applications/" + this.state.app.id;
        request({url: url, method: "delete", json: true, auth: {bearer: this.props.token}}, function (err, res, body) {
            if (err) {
                return self.setState({modal: {error: err.message, show: true, disableBtn: false}});
            }
            if (res.statusCode >= 300) {
                return self.setState({modal: {error: body.message, show: true, disableBtn: false}});
            }
            return redirect("/dashboard/applications");
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
                    id: self.state.app.id,
                    name: body.name,
                    detail: body.detail,
                    redirect: body.redirect
                },
                done: "Application information successfully updated",
                error: null
            });
        });
    }

    // Render the modal to delete the account
    renderModal() {
        if (this.state.modal.show) {
            return (
                <div className="modal">
                    <div className={"modal-content"}>
                        <span className="modal-hide" onClick={() => this.showModal()}>&times;</span>
                        <Heading type={"h4"} className={"modal-title"}>Are you sure?</Heading>
                        {this.renderErrorModal()}
                        <p className="siimple-p">After you confirm this action, all the information related to this
                            application will be removed, and the list of users that allowed it to access their
                            information will be lost. This action can not be undone.</p>
                        <Field>
                            <FieldLabel>Verify this action by typing <i>{this.text_confirm}</i> below</FieldLabel>
                            <Input className="edit-app-input"
                                   type={"text"}
                                   inputRef={this.ref.modalConfirm}/>
                        </Field>
                        {/*Render the button or if it's loading the spinner*/}
                        {this.spinnerButton()}
                    </div>
                </div>
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
                    {/*Modal to delete apps*/}
                    {this.renderModal()}
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
                    {/*Delete application*/}
                    <div className="edit-app-delete">
                        <Heading type={"h5"}>Delete the application</Heading>
                        <Small>Once the application is deleted all its information will be permanently removed.
                        </Small>
                        <Btn color={"grey"} className={"btn"} onClick={() => this.showModal()}>Delete application</Btn>
                    </div>
                </div>
            );
    }
}

export default EditApp;
