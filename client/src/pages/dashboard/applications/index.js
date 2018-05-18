import React from "react";
import {
    Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Spinner, List, ListItem, Small,
    Paragraph
} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";
import * as notification from "../../../commons/notification.js";

import Table from "../../../components/table/index.js";

import "./styles.scss";

class Applications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applications: [],
            ready: false
        };
        this.listApplications = this.listApplications.bind(this);
        this.editRedirect = this.editRedirect.bind(this);
        this.createRedirect = this.createRedirect.bind(this);
    }

    componentDidMount() {
        let self = this;
        request({url: "/api/applications", method: "get", json: true, auth: {bearer: localStorage.getItem("token")}},
            function (err, res, body) {
                if (err) {
                    return notification.error(err.message);
                }
                if (res.statusCode >= 300) {
                    return notification.error(body.message);
                }
                return self.setState({applications: body.applications, ready: true});
            });
    }

    // Redirect the admin to edit the specific application
    editRedirect(item) {
        let url = "/dashboard/applications/" + item.id;
        return redirect(url);
    }

    // Redirect the user to edit the specific application
    createRedirect() {
        return redirect("/dashboard/applications/create");
    }

    // Render a list with all the applications
    listApplications() {
        if (this.state.ready) {
            let customTitle = function (item) {
                return item.name;
            };
            let customDetail = function (item) {
                return "Application created on xxxxxxxxx";
            };
            // Render the table
            return (
                <div className="apps-list">
                    <Table data={this.state.applications} 
                        icon="application" 
                        actionText="Manage"
                        onActionClick={this.editRedirect}
                        customTitle={customTitle} 
                        customDetail={customDetail}/>
                </div>
            );
        }
    }

    render() {
        if(!this.props.admin){
            return(
                <Alert>You must be an administrator to access this route.</Alert>
            );
        }
        else {
            if (!this.state.ready) {
                return (<Spinner/>);
            }
            else
                return (
                    <div className="applications-content">
                        {/*Title*/}
                        <Heading type={"h2"}>Applications</Heading>
                        {/*Create a new application*/}
                        <div className="app-create-container">
                            <Heading type={"h5"}>Create a new application</Heading>
                            <Paragraph>Add a new entity to the list of registered applications.</Paragraph>
                            <Btn color={"green"} className={"btn"} onClick={() => this.createRedirect()}>Create</Btn>
                        </div>
                        {/*List of all the applications*/}
                        <Heading type={"h5"}>Registered applications</Heading>
                        {this.listApplications()}
                    </div>
                );
        }
    }
}

export default Applications;