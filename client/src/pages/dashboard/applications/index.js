import React from "react";
import {Alert, Btn, Heading, Input, Spinner, Small, Paragraph} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";
import * as notification from "../../../commons/notification.js";

import Subhead from "../../../components/subhead/index.js";
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
                        <Subhead headerText="Applications" btnText="New Application" onBtnClick={() => this.createRedirect()}/>
                        <Paragraph>
                            You have <strong>{this.state.applications.length}</strong> applications registered. 
                        </Paragraph>
                        {this.listApplications()}
                    </div>
                );
        }
    }
}

export default Applications;
