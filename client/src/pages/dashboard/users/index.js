import React, {Component} from 'react';
import {Alert, Heading, Paragraph, Spinner} from "neutrine";
import Table from "../../../components/table/index.js";
import {redirectHashbang as redirect} from "rouct";
import {request} from "@kofijs/request";

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            ready: false
        };
    }

    componentWillMount() {
        let self = this;
        request({url: "/api/users", method: "get", json: true, auth: {bearer: localStorage.getItem("token")}},
            function (err, res, body) {
                if (err) {
                    return self.setState({error: err.message});
                }
                if (res.statusCode >= 300) {
                    return self.setState({error: body.message});
                }
                return self.setState({users: body.users, ready: true});
            });
    }

    // Redirect the admin to edit the specific user
    editRedirect(item) {
        let url = "/dashboard/users/" + item.id;
        return redirect(url);
    }

    // Render a list with all the applications
    listUsers() {
        if (this.state.ready) {
            let customTitle = function (item) {
                return item.name;
            };
            let customDetail = function (item) {
                return "User registered on xxxxxxxxx";
            };
            // Render the table
            return (
                <div className="users-list">
                    <Table data={this.state.users}
                           icon="user"
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
                    <div className="users-content">
                        {/*Title*/}
                        <Heading type={"h2"}>Users</Heading>
                        {/*List of all the users*/}
                        <Heading type={"h5"}>Registered users</Heading>
                        {this.listUsers()}
                    </div>
                );
        }
    }
}

export default Users;
