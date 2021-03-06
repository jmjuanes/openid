import React from 'react';
import {request} from "@kofijs/request";
import {equal} from "@kofijs/utils";
import {Alert, Code, Btn, Heading, Input, Small, Spinner, Paragraph} from "neutrine";
import {Field, FieldLabel, FieldHelper, Checkbox, Label} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import Header from "../../../components/header/index.js";

import * as permissions from "../../../commons/permissions.js";
import * as auth from "../../../commons/auth.js";
import * as notification from "../../../commons/notification.js";

import "./style.scss";

//Export application edit component
export default class EditApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "app": null,
            "modalVisible": false,
            "modalLoading": false,
            "keys": null,
            "loading": true 
        };
        this.ref = {
            "name": React.createRef(),
            "description": React.createRef(),
            "redirect": React.createRef(),
            "homepage": React.createRef(),
            "privacy": React.createRef()
        };
        //Assign permissions to ref
        let permissionsList = permissions.getAll();
        for (let i = 0; i < permissionsList.length; i++) {
            let item = permissionsList[i];
            this.ref["permission_" + item.id] = React.createRef();
        }
        //Bind methods
        this.toggleModal = this.toggleModal.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.handleAppDelete = this.handleAppDelete.bind(this);
        this.handleAppUpdate = this.handleAppUpdate.bind(this);
        this.handleShowKeys = this.handleShowKeys.bind(this);
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
            let newData = Object.assign({"id": self.props.request.params.id}, body);
            //Save the application info
            return self.setState({"app": newData, "loading": false});
        });
    }

    // Show or hide the modal
    toggleModal() {
        //Check if modal is loading 
        if (this.state.modalLoading === false) {
            let currentStatus = this.state.modalVisible;
            return this.setState({"modalVisible": !currentStatus, "modalLoading": false});
        }
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
                    return self.setState({"modalLoading": false});
                }
                //Print confirmation and redirect to the applications list
                notification.success("Application '" + appName + "' removed");
                return setTimeout(function () {
                    return redirect("/dashboard/applications");
                }, 500);
            });
        });
    }

    //Update the application info
    handleAppUpdate() {
        let self = this;
        let data = {
            "id": this.state.app.id,
            "name": this.ref.name.current.value,
            "description": this.ref.description.current.value,
            "redirect_url": this.ref.redirect.current.value,
            "homepage_url": this.ref.homepage.current.value,
            "privacy_url": this.ref.privacy.current.value,
            "permissions": []
        };
        //Build the permissions
        permissions.getAll().forEach(function (item) {
            if (self.ref["permission_" + item.id].current.checked === true) {
                data.permissions.push(item.id);
            }
        });
        //Combine the permissions
        data.permissions = data.permissions.join(",");
        // Check that all the info is new
        if (equal(data, this.state.app) === true) {
            //return notification.warning("Change the app information before submitting");
            return redirect("/dashboard/applications");
        }
        // Check that there aren't empty fields
        if (data.name.length === 0) {
            return notification.error("Application name can not be empty");
        }
        if (data.redirect_url.lenght === 0 || data.redirect_url.indexOf("http") === -1) {
            return notification.error("Redirect URL can not be empty");
        }
        //Update the view state 
        return this.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/applications/" + this.props.request.params.id,
                "method": "put",
                "json": true,
                "body": data,
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
    renderDeleteSubmit() {
        if (this.state.modalLoading === false) {
            return <Btn color="error" fluid onClick={this.handleAppDelete}>Delete this application</Btn>;
        } 
        else {
            return <Spinner color="error"/>;
        }
    }

    //Render the modal to delete the application
    renderModal() {
        if (this.state.modalVisible === true) {
            return (
                <div className="pf-modal">
                    <div className="pf-modal-content">
                        <span className="pf-modal-hide" onClick={this.toggleModal}>&times;</span>
                        <Heading type="h4" className="pf-modal-title">Are you sure?</Heading>
                        <Paragraph>
                            After you confirm this action, all the information related to this
                            application will be removed, and the list of users that allowed it to access their
                            information will be lost. This action can not be undone.
                        </Paragraph>
                        {/*Render the button or if it's loading the spinner*/}
                        {this.renderDeleteSubmit()}
                    </div>
                </div>
            );
        }
    }

    //Render the keys 
    renderKeys() {
        if (this.state.keys === null) {
            return <Btn color="navy" onClick={this.handleShowKeys}>Reveal public and secret keys</Btn>;
        } else {
            return (
                <div>
                    <Field>
                        <FieldLabel>Public key</FieldLabel>
                        <Code className="pf-applications-keys">{this.state.keys.public}</Code>
                        <FieldHelper>
                            Use this key to identify your application.
                        </FieldHelper>
                    </Field>
                    <Field>
                        <FieldLabel>Secret key</FieldLabel>
                        <Code className="pf-applications-keys">{this.state.keys.secret}</Code>
                        <FieldHelper>
                            Use this key to decode the token provided when the user authorizes your application. Remember that this key shouldn't be visible in your application.
                        </FieldHelper>
                    </Field>
                </div>
            );
        }
    }

    //Render the permissions list
    renderPermissions() {
        let self = this;
        let children = [];
        //Generate the permissions list
        let permissionsList = (this.state.app.permissions === null) ? [] : this.state.app.permissions.split(",");
        children.push(React.createElement(FieldLabel, {"key": 0}, "Permissions"));
        //Add all the permissions
        permissions.getAll().forEach(function (item, index) {
            let isChecked = permissionsList.indexOf(item.id) !== -1;
            let ref = self.ref["permission_" + item.id];
            let itemCheck = React.createElement(Checkbox, {"defaultChecked": isChecked, "ref": ref});
            let itemText = React.createElement(Label, {}, item.name);
            children.push(React.createElement("div", {"key": index + 1}, itemCheck, itemText));
        });
        //Return the permissions list 
        return React.createElement(Field, {}, children);
    }

    //Render the application submit
    renderUpdateSubmit() {
        if (this.state.loading === true) {
            return <Spinner color="primary"/>;
        }
        else {
            return (
                <Field>
                    <Btn color="primary" onClick={this.handleAppUpdate} style={{"marginRight":"5px"}}>
                        Update application
                    </Btn>
                    <Btn color="error" onClick={this.toggleModal}>Delete this application</Btn>
                </Field>
            );
        }
    }

    //Render the application update form
    renderUpdateForm() {
        if (this.state.app === null) {
            return <Spinner color="primary"/>;
        }
        else {
            return (
                <div>
                    <Field>
                        <FieldLabel>Application name</FieldLabel>
                        <Input type="text" fluid defaultValue={this.state.app.name} ref={this.ref.name}/>
                        <FieldHelper>
                            The name that all users will see.
                        </FieldHelper>
                    </Field>
                    <Field>
                        <FieldLabel>Application description</FieldLabel>
                        <Input type="text" fluid defaultValue={this.state.app.description} ref={this.ref.description}/>
                        <FieldHelper>
                            Brief description about your application.
                        </FieldHelper>
                    </Field>
                    <Field>
                        <FieldLabel>Redirect URL</FieldLabel>
                        <Input type="text" fluid defaultValue={this.state.app.redirect_url} ref={this.ref.redirect}/>
                    </Field>
                    <Field>
                        <FieldLabel>Homepage URL</FieldLabel>
                        <Input type="text" fluid defaultValue={this.state.app.homepage_url} ref={this.ref.homepage}/>
                    </Field>
                    <Field>
                        <FieldLabel>Privacy URL</FieldLabel>
                        <Input type="text" fluid defaultValue={this.state.app.privacy_url} ref={this.ref.privacy}/>
                    </Field>
                    {this.renderPermissions()}
                </div>
            );
        }
    }

    render() {
        if (this.props.admin === false) {
            return <Alert color="error">You must be an administrator to access this route.</Alert>;
        }
        else {
            return (
                <div>
                    {this.renderModal()}
                    {/* Public ans secret keys of the application */}
                    <Header text="Public and secret keys"/>
                    {this.renderKeys()}
                    {/* Update the application information */}
                    <Header text="Application settings"/>
                    {this.renderUpdateForm()}
                    {this.renderUpdateSubmit()}
                </div>
            );
        }
    }
}

