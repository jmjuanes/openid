import React, {Component} from 'react';
import {Alert, Btn, Input, Spinner, Small, Paragraph} from "neutrine";
import {Field, FieldHelper, FieldLabel} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import Header from "../../../../components/header/index.js";

import * as auth from "../../../../commons/auth.js";
import * as notification from "../../../../commons/notification.js";

import "./styles.scss";

//Create app component
export default class CreateApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false
        };
        this.ref = {
            "nameInput": React.createRef(),
            "detailInput": React.createRef(),
            "redirectInput": React.createRef()
        };
        this.handleCreateApp = this.handleCreateApp.bind(this);
    }

    // Create a new application
    handleCreateApp() {
        let self = this;
        let info = {
            "name": this.ref.nameInput.current.value,
            "detail": this.ref.detailInput.current.value,
            "redirect": this.ref.redirectInput.current.value
        };
        // Check that there aren't empty fields
        if (info.name.length === 0 || info.detail.length === 0 || info.redirect.length === 0) {
            return notification.warning("No field can be empty");
        }
        if (info.redirect.indexOf(".") === -1) {
            return notification.warning("Invalid URL");
        }
        return this.setState({"loading": true}, function () {
            //Initialize the request options
            let requestOptions = {
                "url": "/api/applications",
                "method": "post",
                "json": true,
                "body": info,
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
            return <Btn color={"blue"} onClick={this.handleCreateApp}>Create application</Btn>;
        }
    }

    render() {
        if (this.props.admin === false) {
            return <Alert>You must be an administrator to access this route.</Alert>;
        }
        else {
            return (
                <div>
                    <Header text="Register a new application"/>
                    <Paragraph>Please check that all fields are correct before submitting.</Paragraph>
                    {/*Application name*/}
                    <Field>
                        <FieldLabel>Name of the application</FieldLabel>
                        <Input type={"text"} fluid ref={this.ref.nameInput}/>
                    </Field>
                    {/*Application description*/}
                    <Field>
                        <FieldLabel>Detail of the application</FieldLabel>
                        <Input type={"text"} fluid ref={this.ref.detailInput}/>
                    </Field>
                    {/*Application redirect url*/}
                    <Field>
                        <FieldLabel>Redirect URL</FieldLabel>
                        <Input type={"text"} fluid ref={this.ref.redirectInput}/>
                        <FieldHelper>Must be a valid URL</FieldHelper>
                    </Field>
                    {this.renderSubmit()}
                </div>
            );
        }
    }
}

