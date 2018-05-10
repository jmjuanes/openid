import React from "react";
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Spinner, List, ListItem} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

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
    }

    componentDidMount() {
        let self = this;
        request({url: "/api/applications", method: "get", json: true, auth: {bearer: this.props.token}},
            function (err, res, body) {
                if (err) {
                    return self.setState({error: err.message});
                }
                if (res.statusCode >= 300) {
                    return self.setState({error: body.message});
                }
                return self.setState({applications: body.applications, ready: true});
            });
    }

    // Redirect the user to edit the specific application
    editRedirect(i) {
        let url = "/dashboard/applications/" + this.state.applications[i].id;
        return redirect(url);
    }

    // Render a list with all the applications
    listApplications() {
        if (this.state.ready) {
            return (
                <div className="apps-list">
                    <List>
                        {this.state.applications.map((app, i) =>
                            <ListItem key={i} className={"app-item"}>
                                <div className={"app-title"}>{app.name}</div>
                                <div className={"app-btn-group"}>
                                    <Btn color={"blue"} onClick={() => this.editRedirect(i)}>Edit</Btn>
                                </div>
                            </ListItem>
                        )}
                    </List>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="applications-content">
                {/*Title*/}
                <Heading type={"h2"}>Applications</Heading>
                {/*List of all the applications*/}
                {this.listApplications()}
            </div>
        );
    }
}

export default Applications;