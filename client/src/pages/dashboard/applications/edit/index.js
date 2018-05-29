import React from 'react';
import {request} from "@kofijs/request";
import {Alert, Code, Btn, Heading, Input, Small, Spinner, Paragraph} from "neutrine";
import {Field, FieldLabel, FieldHelper} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import Subhead from "../../../../components/subhead/index.js";

import * as auth from "../../../../commons/auth.js";
import * as notification from "../../../../commons/notification.js";

import "./styles.scss";

export default class EditApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "app": null,
            "modalVisible": false,
            "modalLoading": false,
            "keys": {
                "public": null,
                "secret": null,
                "visible": false
            },
            "loading": true
        };
        this.ref = {
            "nameInput": React.createRef(),
            "detailInput": React.createRef(),
            "redirectInput": React.createRef(),
            "modalConfirm": React.createRef()
        };
        //Bind update app functiom
        this.updateApp = this.updateApp.bind(this);
        // Functions from the modal
        this.toggleModal = this.toggleModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
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
            let newData = {
                "id": self.props.request.params.id,
                "name": body.name,
                "detail": body.detail,
                "redirect": body.redirect
            };
            //Save the application info
            return self.setState({"app": newData, "loading": false});
        });
    }

    // Show or hide the modal
    toggleModal() {
        //Check if modal is loading 
        if (this.state.modalLoading === true) {
            return false;
        }
        //Get the current status
        let currentStatus = this.state.modalVisible;
        return this.setState({"modalVisible": !currentStatus, "modalLoading": false});
    }

    //Handle public and secret keys
    handleShowKeys() {
        //Check the current status of the application 
        if (this.state.loading === true) {
            return null;
        }
        let self = this;
        let requestOptions = {
            "url": "/api/applications/" + this.state.app.id + "/secret",
            "method": "get",
            "json": true,
            "auth": auth.generateAuth()
        };
        //Import the secret key
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
        let appName = this.state.app.name;
        // Block the button meanwhile
        this.setState({"modalLoading": true}, function () {
            let requestOptions = {
                "url": "/api/applications/" + this.state.app.id,
                "method": "delete",
                "json": true,
                "auth": auth.generateAuth()
            };
            //App delete request
            return request(requestOptions, function (err, res, body) {
                if (err) {
                    notification.error(err.message);
                    return self.setState({"modalLoading": false});
                }
                if (res.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"modalLoading": true});
                }
                //Print confirmation and redirect to the applications list
                notification.success("Application '" + appName + "' removed");
                return setTimeout(function () {
                    return redirect("/dashboard/applications");
                }, 500);
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
        //Update the view state 
        return this.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/applications/" + this.props.request.params.id,
                "method": "put",
                "json": true,
                "body": info,
                "auth": auth.generateAuth()
            };
            //Sed the put request
            return request(requestOptions, function (err, res, body) {
                if (err) {
                    notification.error(err.message);
                    return self.setState({"loading": false});
                }
                if (res.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                // Set the new info
                notification.success("Application updated successfully");
                //Redirect to the applications list
                return setTimeout(function () {
                    return redirect("/dashboard/applications"); 
                }, 500);
            });
        });
    }

    //Render the delete button/spinner inside the modal
    renderSpinnerButton() {
        if (this.state.modalLoading === false) {
            return (<Btn color={"error"} fluid onClick={() => this.handleAppDelete()}>Delete this application</Btn>);
        } else {
            return (<Spinner color="error"/>);
        }
    }

    // Render the modal to delete the application
    renderModal() {
        if (this.state.modalVisible === true) {
            return (
                <div className="modal">
                    <div className={"modal-content"}>
                        <span className="modal-hide" onClick={() => this.toggleModal()}>&times;</span>
                        <Heading type={"h4"} className={"modal-title"}>Are you sure?</Heading>
                        <Paragraph>
                            After you confirm this action, all the information related to this
                            application will be removed, and the list of users that allowed it to access their
                            information will be lost. This action can not be undone.
                        </Paragraph>
                        {/*Render the button or if it's loading the spinner*/}
                        {this.renderSpinnerButton()}
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

    //Render the application information form
    renderApplicationForm() {
        //Check for loading state 
        if (this.state.loading === true) {
            return (<Spinner color="primary" style={{"marginTop": "20px"}}/>);
        }
        //Render the application form
        return (
           <div>
               <Field>
                   <FieldLabel>Application name</FieldLabel>
                   <Input type={"text"} fluid defaultValue={this.state.app.name} ref={this.ref.nameInput}/>
                   <FieldHelper>
                       The name that all users will see.
                   </FieldHelper>
               </Field>
               <Field>
                   <FieldLabel>Application detail</FieldLabel>
                   <Input type={"text"} fluid defaultValue={this.state.app.detail} ref={this.ref.detailInput}/>
                   <FieldHelper>
                       Brief description about your application.
                   </FieldHelper>
               </Field>
               <Field>
                   <FieldLabel>Redirect URL</FieldLabel>
                   <Input type={"text"} fluid defaultValue={this.state.app.redirect} ref={this.ref.redirectInput}/>
               </Field>
               <Btn color={"blue"} onClick={() => this.updateApp()} style={{"marginRight":"5px"}}>
                   Update application
               </Btn>
               <Btn color={"red"} className={"btn"} onClick={() => this.toggleModal()}>
                   Delete this application
               </Btn>
           </div>
        );
    }

    render() {
        if (this.props.admin === false) {
            return (<Alert color={"error"}>You must be an administrator to access this route.</Alert>);
        }
        else {
            return (
                <div>
                    {this.renderModal()}
                    {/* Public ans secret keys of the application  */}
                    <Subhead headerText="Public and secret keys"/>
                    {this.renderKeys()}
                    {/* Update the application information  */}
                    <Subhead headerText="Application settings"/>
                    {this.renderApplicationForm()}
                </div>
            );
        }
    }
}

