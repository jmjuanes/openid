import React from "react";
import {Alert, Btn, Heading, Input, Spinner, Small, Paragraph} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import Header from "../../../components/header/index.js";
import Table from "../../../components/table/index.js";

import * as auth from "../../../commons/auth.js";
import * as notification from "../../../commons/notification.js";

//Applications list component
export default class Applications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "applications": [],
            "loading": true
        };
        //Bind methods
        this.redirectToEdit = this.redirectToEdit.bind(this);
        this.redirectToCreate = this.redirectToCreate.bind(this);
    }

    componentDidMount() {
        let self = this;
        let requestOptions = {
            "url": "/api/applications",
            "method": "get",
            "json": true,
            "auth": auth.generateAuth()
        };
        //Import the list with all the applications
        return request(requestOptions, function (err, res, body) {
            if (err) {
                return notification.error(err.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            //Update the state
            return self.setState({
                "applications": body.applications, 
                "loading": false
            });
        });
    }

    //Redirect the admin to edit the specific application
    redirectToEdit(item) {
        return redirect("/dashboard/applications/" + item.id);
    }

    //Redirect the user to edit the specific application
    redirectToCreate() {
        return redirect("/dashboard/applications/create");
    }

    //Render a list with all the applications
    renderApplications() {
        //Check for loading
        if (this.state.loading === true) {
            return <Spinner color="primary" style={{"marginTop": "20px"}}/>;
        } 
        let customTitle = function (item) {
            return item.name;
        };
        let customDetail = function (item) {
            return "Application created on xxxxxxxxx";
        };
        //Render the table
        return (
            <div>
                {/* Display the number of registered applications */}
                <Paragraph>
                    You have <strong>{this.state.applications.length}</strong> applications registered.
                </Paragraph>
                {/* Display the table with all the applications */}
                <Table data={this.state.applications} 
                    icon="application" 
                    actionText="Manage"
                    onActionClick={this.redirectToEdit}
                    customTitle={customTitle} 
                    customDetail={customDetail}/>
            </div>
        );
    }

    render() {
        //Check if the user is an administrator
        if (this.props.isAdmin === false && this.props.isOwner === false) {
            return <Alert>You must be an administrator to access this route.</Alert>;
        }
        return (
            <div>
                {/* Subheader with the button to register a new application */}
                <Header text="Applications" btnText="New Application" onBtnClick={this.redirectToCreate}/>
                {/* Render the table with all the applications */}
                {this.renderApplications()}
            </div>
        );
    }
}

