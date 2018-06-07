import React from "react";
import {Btn, Field, FieldHelper, FieldLabel, Input, Textarea, Spinner} from "neutrine";
import {request} from "@kofijs/request";
import {equal} from "@kofijs/utils";

import Header from "../../../components/header/index.js"; 

import * as notification from "../../../commons/notification.js";
import * as auth from "../../../commons/auth.js";

//User profile screen
export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "user": null,
            "loading": false
        };
        this.ref = {
            "name": React.createRef(),
            "biography": React.createRef(),
            "company": React.createRef(),
            "location": React.createRef()
        };
        //Bind methods
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Get the user info using his access token
    componentDidMount() {
        let self = this;
        let requestOptions = {
            "url": "/api/user",
            "method": "get",
            "json": true,
            "auth": auth.generateAuth()
        };
        //Import the user information from the api
        return request(requestOptions, function (error, response, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (response.statusCode >= 300) {
                return notification.error(body.message);
            }
            //Update the state with the new user data
            let newUserData = {
                "name": body.name,
                "biograpby": body.biography,
                "company": body.company,
                "location": body.location
            };
            return self.setState({"user": newUserData});
        });
    }

    //Update the user's information
    handleSubmit() {
        let self = this;
        let data = {
            "name": this.ref.name.current.value,
            "biography": this.ref.biography.current.value,
            "company": this.ref.company.current.value,
            "location": this.ref.location.current.value
        };
        //Check if there is no data to update
        if (equal(data, this.state.user) === true) {
            return false;
        }
        //Change the current state
        return self.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/user",
                "method": "put",
                "json": true,
                "body": data
            };
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"loading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                //Display success
                notification.success("Information updated successfully");
                return self.setState({"user": data, "loading": false});
            });
        });
    }

    //Render the submit button 
    renderSubmit() {
        if (this.state.loading === true) {
            return <Spinner color="primary"/>;
        }
        else {
            return <Btn color="primary" onClick={this.handleSubmit}>Update profile</Btn>;
        }
    }

    render() {
        if (this.state.user === null) {
            return <Spinner color="primary"/>;
        } 
        else {
            return (
                <div>
                    <Header text="Profile"/>
                    <Field>
                        <FieldLabel>Name</FieldLabel>
                        <Input type="text" fluid defaultValue={this.state.user.name} ref={this.ref.name}/>
                    </Field>
                    <Field>
                        <FieldLabel>Biography</FieldLabel>
                        <Textarea fluid ref={this.ref.biography}>{this.state.user.biography}</Textarea>
                    </Field>
                    <Field>
                        <FieldLabel>Company</FieldLabel>
                        <Input tyle="text" fluid defaultValue={this.state.user.company} ref={this.ref.company}/>
                    </Field>
                    <Field>
                        <FieldLabel>Location</FieldLabel>
                        <Input type="text" fluid defaultValue={this.state.user.location} ref={this.ref.location}/>
                    </Field>
                    <Field>
                        <FieldHelper>
                            All the fields on this page are optional and can be deleted at any time. You can allow the applications to access the information that you provide on this page.
                        </FieldHelper>
                    </Field>
                    {this.renderSubmit()}
                </div>
            );
        }
    }
}

