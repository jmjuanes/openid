import React, {Component} from 'react';
import {Alert, Btn, Input, Spinner, Small, Paragraph} from "neutrine";
import {Field, FieldHelper, FieldLabel} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import Header from "../../../components/header/index.js";

import * as auth from "../../../commons/auth.js";
import * as notification from "../../../commons/notification.js";
import * as permissions from "../../../commons/permissions.js";

//Create app component
export default class CreateApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false
        };
        this.ref = {
            "name": React.createRef(),
            "description": React.createRef(),
            "redirect": React.createRef(),
            "homepage": React.createRef(),
            "privacy": React.createRef()
        };
        //Create the reference for the permissions
        let permissionsList = permissions.getAll();
        for (let i = 0; i < permissionsList.length; i++) {
            let permission = permissionsList[i];
            this.ref["permission_" + permission.id] = React.createRef();
        }
        //Bind methods
        this.renderPermissions = this.renderPermissions.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Create a new application
    handleSubmit() {
        let self = this;
        let data = {
            "name": this.ref.name.current.value,
            "description": this.ref.description.current.value,
            "redirect_url": this.ref.redirect.current.value,
            "homepage_url": this.ref.homepage.current.value,
            "privacy_url": this.ref.privacy.current.value,
            "permissions": []
        };
        // Check that there aren't empty fields
        if (data.name.length === 0) {
            return notification.error("Application name can not be empty");
        }
        if (data.redirect_url.indexOf("http") === -1 || data.redirect_url.indexOf("://") === -1) {
            return notification.warning("Invalid redirect url");
        }
        //Add the permissions
        permissions.getAll().forEach(function (item) {
            if (self.ref["permission_" + item.id].current.checked === true) {
                data.permissions.push(item.id);
            }
        });
        //Join all permissions
        data.permisssions = data.permissions.join(",");
        return this.setState({"loading": true}, function () {
            //Initialize the request options
            let requestOptions = {
                "url": "/api/applications",
                "method": "post",
                "json": true,
                "body": data,
                "auth": auth.generateAuth()
            };
            //Register the new application
            return request(requestOptions, function (err, res, body) {
                if (err) {
                    notification.error(err.message);
                    return self.setState({"loading": false});
                }
                if (res.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false}); 
                }
                //Display application created message
                notification.success("Application successfully created");
                //Redirect to the applications list
                return setTimeout(function() {
                    return redirect("/dashboard/applications");
                }, 500);
            });
        });
    }

    //Render the application submit
    renderSubmit() {
        //Check for loading status
        if (this.state.loading === true) {
            return <Spinner color="primary"/>;
        } 
        else {
            return <Btn color="primary" onClick={this.handleSubmit}>Create application</Btn>;
        }
    }

    //Render the permissions
    renderPermissions() {
        let self = this;
        let children = [];
        //Add all available permissions
        permissions.getAll().forEach(function (item, index) {
            let itemCheckbox = React.createElement(Checkbox, {"ref": self.ref["permission_" + item.id]});
            let itemName = React.createElement(Label, {}, item.name);
            children.push(React.createElement("div", {"key": index}, itemCheckbox, itemName));
        });
        //Return the permissions list
        return React.createElement(Field, {}, children);
    }

    render() {
        if (this.props.isAdmin === false) {
            return <Alert>You must be an administrator to access this route.</Alert>;
        }
        else {
            return (
                <div>
                    <Header text="Register a new application"/>
                    <Paragraph>Please check that all fields are correct before submitting.</Paragraph>
                    <Field>
                        <FieldLabel>Name of the application</FieldLabel>
                        <Input type="text" fluid ref={this.ref.name}/>
                    </Field>
                    <Field>
                        <FieldLabel>Detail of the application</FieldLabel>
                        <Input type="text" fluid ref={this.ref.description}/>
                    </Field>
                    <Field>
                        <FieldLabel>Redirect URL</FieldLabel>
                        <Input type"text" fluid ref={this.ref.redirect}/>
                        <FieldHelper>Must be a valid URL</FieldHelper>
                    </Field>
                    <Field>
                        <FieldLabel>Homepage URL</FieldLabel>
                        <Input type="text" fluid ref={this.ref.homepage}/>
                        <FieldHelper>URL where the users can know more about your application</FieldHelper>
                    </Field>
                    <Field>
                        <FieldLabel>Privacy URL</FieldLabel>
                        <Input type="text" fluid ref={this.ref.privacy}/>
                        <FieldHelper>URL to your privacy policy</FieldHelper>
                    </Field>
                    {this.renderPermissions()}
                    {this.renderSubmit()}
                </div>
            );
        }
    }
}

