import React from 'react';
import {request} from "@kofijs/request";
import {Alert, Code, Btn, Heading, Input, Small, Spinner} from "neutrine";
import {Field, FieldLabel, FieldHelper} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import * as auth from "../../../../commons/auth.js";
import * as notification from "../../../../commons/notification.js";

import "./styles.scss";

export default class EditApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "app": {},
            "ready": false,
            "modal": {
                "show": false,
                "disableBtn": false
            },
            "keys": {
                "public": null,
                "secret": null,
                "visible": false
            }
        };
        this.ref = {
            "nameInput": React.createRef(),
            "detailInput": React.createRef(),
            "redirectInput": React.createRef(),
            "modalConfirm": React.createRef()
        };
        this.text_confirm = "Yes, delete this app";

        this.updateApp = this.updateApp.bind(this);

        // Functions from the modal
        this.showModal = this.showModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.spinnerButton = this.spinnerButton.bind(this);
        this.handleAppDelete = this.handleAppDelete.bind(this);
    }

    componentWillMount() {
        let self = this;
        let requestOptions = {
            "url": "/api/applications/" + this.props.request.params.id, 
            "json": true, 
            "auth": auth.generateAuth()
        };
        //Get the application info
        return request(requestOptions, function (err, res, body) {
            if (err) {
                return notification.error(err.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            //Save the application info
            return self.setState({
                "app": {
                    "id": self.props.request.params.id,
                    "name": body.name,
                    "detail": body.detail,
                    "redirect": body.redirect
                },
                "ready": true
            });
        });
    }

    // Show or hide the modal
    showModal() {
       return this.setState({
            "modal": {
                "show": !this.state.modal.show,
                "disableBtn": false
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

    //Handle public and secret keys
    handleShowKeys() {
        let self = this;
        let requestOptions = {
            "url": "/api/applications/" + this.state.app.id + "/secret",
            "method": "get",
            "json": true,
            "auth": auth.generateAuth()
        };
        return request(requestOptions, function (error, res, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            let newState = {
                "visible": true,
                "public": self.state.app.id,
                "secret": body.secret
            };
            return self.setState({"keys": newState});
        });
    }

    // Delete the app
    handleAppDelete() {
        let self = this;
        // Block the button meanwhile
        this.setState({modal: {show: true, disableBtn: true}}, function () {
            // Check text before calling the api
            if (this.ref.modalConfirm.current.value !== this.text_confirm) {
                notification.warning("Please type the exact confirmation text");
                return this.setState({
                    "modal": {
                        "show": true, 
                        "disableBtn": false
                    }
                });
            }
            //Request options
            let requestOptions = {
                "url": "/api/applications/" + this.state.app.id,
                "method": "delete",
                "json": true,
                "auth": auth.generateAuth()
            };
            return request(requestOptions, function (err, res, body) {
                if (err) {
                    notification.error(err.message);
                    return this.setState({
                        "modal": {
                            "show": true, 
                            "disableBtn": false
                        }
                    });
                }
                if (res.statusCode >= 300) {
                    notification.error(body.message);
                    return this.setState({
                        "modal": {
                            "show": true, 
                            "disableBtn": false
                        }
                    });
                }
                return setTimeout(function () {
                    return redirect("/dashboard/applications");
                }, 1000);
            });
        });
    }

    // Update the application info
    updateApp() {
        let self = this;
        let info = {
            "name": this.ref.nameInput.current.value,
            "detail": this.ref.detailInput.current.value,
            "redirect": this.ref.redirectInput.current.value
        };
        // Check that all the info is new
        if (info.name === this.state.app.name && info.detail === this.state.app.detail && info.redirect === this.state.app.redirect) {
            return notification.warning("Change the app information before submitting");
        }
        // Check that there aren't empty fields
        if (info.name.length === 0 || info.detail.length === 0 || info.redirect.length === 0) {
            return notification.warning("No field can be empty");
        }
        let requestOptions = {
            "url": "/api/applications/" + this.props.request.params.id,
            "method": "put",
            "json": true,
            "body": info,
            "auth": auth.generateAuth()
        };
        return request(requestOptions, function (err, res, body) {
            if (err) {
                return notification.error(err.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            // Set the new info
            notification.success("Application updated successfully");
            //New application data
            let newData = {
                "id": self.state.app.id,
                "name": body.name,
                "detail": body.detail,
                "redirect": body.redirect
            };
            //Redirect to the applications list
            return setTimeout(function () {
                return redirect("/dashboard/applications"); 
            }, 500);
            //return self.setState({"app": newData});
        });
    }

    // Render the modal to delete the application
    renderModal() {
        if (this.state.modal.show) {
            return (
                <div className="modal">
                    <div className={"modal-content"}>
                        <span className="modal-hide" onClick={() => this.showModal()}>&times;</span>
                        <Heading type={"h4"} className={"modal-title"}>Are you sure?</Heading>
                        <p className="siimple-p">After you confirm this action, all the information related to this
                            application will be removed, and the list of users that allowed it to access their
                            information will be lost. This action can not be undone.</p>
                        <Field>
                            <FieldLabel>Verify this action by typing <i>{this.text_confirm}</i> below</FieldLabel>
                            <Input className="modal-input"
                                   type={"text"}
                                   ref={this.ref.modalConfirm}/>
                        </Field>
                        {/*Render the button or if it's loading the spinner*/}
                        {this.spinnerButton()}
                    </div>
                </div>
            );
        }
    }

    renderKeys() {
        if (this.state.keys.visible === false) {
            return (
                <div className="edit-app-keys">
                    <Btn color="navy" onClick={() => this.handleShowKeys()}>
                        Reveal public and secret keys
                    </Btn>        
                </div>
            );
        } else {
            return (
                <div className="edit-app-keys">
                    <Field>
                        <FieldLabel>Public key</FieldLabel>
                        <Code className="edit-app-keys-container">{this.state.keys.public}</Code>
                    </Field>
                    <Field>
                        <FieldLabel>Secret key</FieldLabel>
                        <Code className="edit-app-keys-container">{this.state.keys.secret}</Code>
                    </Field>
                </div>
            );
        }
    }

    render() {
        if (!this.props.admin) {
            return (
                <Alert color={"red"}>You must be an administrator to access this route.</Alert>
            );
        }
        else {
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
                        {/*Key info from the application*/}
                        <Heading type="h5">Public and secret keys</Heading>
                        {this.renderKeys()}
                        {/*Form title*/}
                        <Heading type={"h5"}>Manage the application information</Heading>
                        <div className="edit-app-form">
                            {/*Name input*/}
                            <Field>
                                <FieldLabel>Application name</FieldLabel>
                                <Input className="edit-app-input"
                                       type={"text"}
                                       fluid
                                       defaultValue={this.state.app.name}
                                       ref={this.ref.nameInput}/>
                                <FieldHelper>
                                    The name that all users will see.
                                </FieldHelper>
                            </Field>
                            {/*Detail input*/}
                            <Field>
                                <FieldLabel>Application detail</FieldLabel>
                                <Input className="edit-app-input"
                                       type={"text"}
                                       fluid
                                       defaultValue={this.state.app.detail}
                                       ref={this.ref.detailInput}/>
                                <FieldHelper>
                                    Brief description about your application.
                                </FieldHelper>
                            </Field>
                            {/*Redirect input*/}
                            <Field>
                                <FieldLabel>Redirect URL</FieldLabel>
                                <Input className="edit-app-input"
                                       type={"text"}
                                       fluid
                                       defaultValue={this.state.app.redirect}
                                       ref={this.ref.redirectInput}/>
                            </Field>
                            <Btn color={"blue"} onClick={() => this.updateApp()} style={{"marginRight":"5px"}}>
                                Update application
                            </Btn>
                            <Btn color={"red"} className={"btn"} onClick={() => this.showModal()}>
                                Delete this application</Btn>
                        </div>
                    </div>
                );
        }
    }
}

