import React from "react";
import {Btn, Field, FieldHelper, FieldLabel, Heading, Small, Spinner} from 'neutrine';
import {Card, CardTitle, CardBody} from "neutrine";
import {request} from "@kofijs/request";
import {format} from "@kofijs/utils";
import {redirectHashbang as redirect} from "rouct";

import "./styles.scss";

import * as auth from "../../commons/auth.js";
import * as notification from "../../commons/notification.js";
import * as permissions from "../../commons/permissions.js";

//Authorize class
export default class Authorize extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "app": null,
            "loading": true
        };
        //Bind functions
        this.handleAuthorization = this.handleAuthorization.bind(this);
    }

    componentDidMount() {
        //Check the application ID
        if (typeof this.props.request.query.id !== "string") {
            return notification.error("No application ID provided");
        }
        let id = this.props.request.query.id;
        //Check if the user is logged in
        if (auth.hasToken() === false) {
            let continueUrl = window.encodeURIComponent("/authorize/?id=" + id);
            return redirect("/login?continueTo=" + continueUrl);
        }
        let self = this;
        //Import the application information
        let requestOptions = {
            "url": "/api/applications/" + id,
            "method": "get",
            "json": true
        };
        return request(requestOptions, function (error, response, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (response.statusCode >= 300) {
                return notification.error(body.message);
            }
            //Save the application information
            return self.setState({"app": body, "loading": false});
        });
    }

    //Authorize and redirect
    handleAuthorization() {
        let self = this;
        let id = this.props.request.query.id;
        return this.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/user/authorizations/" + id,
                "method": "post",
                "json": true,
                "auth": auth.generateAuth()
            };
            //Do the request to the authorize route
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"loading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                console.log(body);
                //The API returns a client token
                //let url = self.app.redirect + "/test?token=" +body.client_token;
                //let url = "http://localhost:5000" + "/test?token=" + body.client_token;
                //Redirect to the generated url
                //window.location.replace(url);
                return self.setState({"loading": false}, function () {
                    let redirectUrl = format(self.state.app.redirect_url, body);
                    console.log("Redirect to -->" + redirectUrl);
                    //window.location.href = redirectUrl;
                });
            });
        });
    }

    //Render the permissions list
    renderPermissions() {
        let children = [];
        //Loop over all permissions of the application
        let permissionsList = []; 
        if (typeof this.state.app.permissions === "string") {
            //Split the permissions by comma and filter the generated list
            permissionsList = this.state.app.permissions.split(",").filter(function (key) {
                return key.trim().length > 0;
            });
        }
        //Check the number of permissions
        if (permissionsList.length === 0) {
            let text = "This application does not need to access to your personal information."
            let content = React.createElement(Small, {"className": "pf-authorize-permissions-description"}, text);
            children.push(React.createElement(CardBody, {"key": 0, "align": "center"}, content));
        }
        else {
            //Display all the permissions
            permissionsList.split(",").forEach(function (key, index) {
                //Get the permission information
                let item = permissions.get(key);
                let itemTitle = React.createElement(CardTitle, {"className": "pf-authorize-permissions-title"}, item.name);
                let itemContent = React.createElement(Small, {"className": "pf-authorize-permissions-description"}, item.description);
                //Save the list item element
                children.push(React.createElement(CardBody, {"key": index}, itemTitle, itemContent));
            });
        }
        //Return the list element
        return React.createElement(Card, {"className": "pf-authorize-permissions"}, children);
    }

    render() {
        //Show a loading screen before getting the info from the API
        if (this.state.loading === true) {
            return <Spinner color="primary" className="pf-authorize-loading"/>;
        }
        else {
            return (
                <div className="pf-authorize-content">
                    <Heading align="center" type="h2">
                        Authorize {this.state.app.name}
                    </Heading>
                    <Small className="pf-authorize-subtitle" align="center">
                        <strong>{this.state.app.name}</strong> is requesting permission to access the following information of your account:
                    </Small>
                    {this.renderPermissions()}
                    <Small className="pf-authorize-privacy">
                        By clicking <strong>Authorize {this.state.app.name}</strong>, you allow this application to use your information in accordance with its privacy policy and terms of service. 
                        You can always revoke the access of this application to your personal information in your dashboard. 
                    </Small>
                    <Btn color="primary" className="pf-authorize-submit" onClick={this.handleAuthorization} fluid>
                        Authorize <strong>{this.state.app.name}</strong>
                    </Btn>
                    <Small className="pf-authorize-footer">
                        After authorizing the application you will be redirected to its website
                    </Small>
                </div>
            );
        }
    }
}

