import React, {Component} from 'react';
import {Alert, Btn, Field, FieldLabel, Heading, Input, Label, Paragraph, Select, Spinner, Switch, Tag} from "neutrine";
import Table from "../../../components/table/index.js";
import TableUsers from "../../../components/table_users/index.js";
import {redirectHashbang as redirect} from "rouct";
import {request} from "@kofijs/request";
import * as notification from "../../../commons/notification.js";

import "./styles.scss";

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            ready: false,
            modal: {
                show: false
            }
        };
        this.ref = {
            deleteConfirm: React.createRef(),
            activeSwitch: React.createRef(),
            roleSelect: React.createRef()
        };
        this.textConfirm = "Yes, delete this user";

        this.showModal = this.showModal.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.renderRoleSelect = this.renderRoleSelect.bind(this);
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

    //Show the modal and set the user to display
    showModal(item, index, action) {
        //The user cannot delete himself
        if (item !== null) {
            if (this.props.user.id === item.id || (item.is_admin && !this.props.user.owner)) {
                return;
            }
        }
        return this.setState({
            modal: {
                show: !this.state.modal.show,
                user: item,
                index: index,
                action: action
            }
        });
    }

    // Render a list with all the applications
    listUsers() {
        if (this.state.ready) {
            let customTitle = function (item) {
                return item.name;
            };
            let customDetail = function (item) {
                return item.email;
            };
            // Render the table
            return (
                <div className="users-list">
                    <TableUsers data={this.state.users}
                                icon="user"
                                admin={this.props.user}
                                editUser={this.showModal}
                                customTitle={customTitle}
                                customDetail={customDetail}/>
                </div>
            );
        }
    }

    renderRoleSelect(info) {
        if (this.props.user.owner) {
            return (
                <Field className="modal-role-section">
                    <FieldLabel>Role of the user:</FieldLabel>
                    <Select defaultValue={info.role} ref={this.ref.roleSelect}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </Select>
                </Field>
            );
        }
    }

    // Render the modal to delete the application
    renderModal() {
        if (this.state.modal.show) {
            if (this.state.modal.action === "edit") {
                //Prepare the tag and the initial state of the switch
                let info = this.state.modal.user.is_active ?
                    {color: "green", text: "Active", switch: true} :
                    {color: "light", text: "Inactive", switch: false};
                //To set the default select value
                info.role = this.state.modal.user.is_admin ? "admin" : "user";
                return (
                    <div className="modal">
                        <div className={"modal-content"}>
                            {/*Close button*/}
                            <span className="modal-hide" onClick={() => this.showModal(null, null, null)}>&times;</span>
                            {/*Title*/}
                            <Heading type={"h4"} className={"modal-title"}>Edit user</Heading>
                            {/*Subtitle*/}
                            <p className="siimple-p">Make the desired changes in the user and click <b>Save</b> to
                                confirm them.</p>
                            {/*Active tag*/}
                            <Field className="modal-active-section">
                                <Label htmlFor="active-switch">User active</Label>
                                <Switch defaultChecked={info.switch} id={"active-switch"}
                                        ref={this.ref.activeSwitch}>
                                </Switch>
                            </Field>
                            {/*Role select*/}
                            {this.renderRoleSelect(info)}
                            {/*Buttons*/}
                            <div className="modal-btn-section">
                                <Btn color={"blue"} onClick={this.updateUser}>Save</Btn>
                                <Btn color={"light"} onClick={() => this.showModal(null, null, null)}>Cancel</Btn>
                            </div>
                        </div>
                    </div>
                );
            }
            else if (this.state.modal.action === "delete") {
                return (
                    <div className="modal">
                        <div className={"modal-content"}>
                            <span className="modal-hide" onClick={() => this.showModal(null, null, null)}>&times;</span>
                            <Heading type={"h4"} className={"modal-title"}>Are you sure?</Heading>
                            <p className="siimple-p">Once you delete this user all his data will be permanently lost,
                                and the only way he'll be able to use the application again will be by creating a new
                                account.</p>
                            <Field>
                                <FieldLabel>Verify this action by typing <i>{this.textConfirm}</i> below</FieldLabel>
                                <Input className="modal-input"
                                       type={"text"}
                                       ref={this.ref.deleteConfirm}/>
                            </Field>
                            <Btn color={"red"} fluid onClick={this.deleteUser}>Delete user</Btn>
                        </div>
                    </div>
                );
            }
        }
    }

    //Edit the user information
    updateUser() {
        let self = this;
        let modUser = this.state.modal.user;
        let info = {
            is_active: this.ref.activeSwitch.current.checked
        };
        if(this.props.user.owner){
            info.is_admin = this.ref.roleSelect.current.value === "admin";
        }
        //Check that a change has been made in the info to update
        let hasChanged = this.props.user.owner ? info.is_active === modUser.is_active && info.is_admin === modUser.is_admin : info.is_active === modUser.is_active;
        if (hasChanged) {
            return notification.warning("Change the user info before updating")
        }
        //Do the request
        let url = "/api/users/" + this.state.modal.user.id;
        request({url: url, method: "put", json: true, body: info, auth: {bearer: localStorage.getItem("token")}},
            function (err, res, body) {
                if (err) {
                    return notification.error(err.message);
                }
                if (res.statusCode >= 300) {
                    return notification.error(body.message);
                }
                //Update the state users array
                let new_users = self.state.users;
                new_users[self.state.modal.index].is_admin = info.is_admin;
                new_users[self.state.modal.index].is_active = info.is_active;
                //Confirm success
                notification.success("User information updated");
                //Update the users array and close the modal
                return self.setState({
                    users: new_users,
                    modal: {
                        show: false
                    }
                });
            });
    }

    //Delete the user
    deleteUser() {
        let self = this;
        //Check the text confirmation
        if (this.textConfirm !== this.ref.deleteConfirm.current.value) {
            return notification.warning("Type the exact confirmation text");
        }
        let url = "/api/users/" + this.state.modal.user.id;
        //Do the request
        request({url: url, method: "delete", json: true, auth: {bearer: localStorage.getItem("token")}},
            function (err, res, body) {
                if (err) {
                    return notification.error(err.message);
                }
                if (res.statusCode >= 300) {
                    return notification.error(body.message);
                }
                //Delete the user from the array of users
                let new_users = self.state.users;
                new_users.splice(self.state.modal.index, 1);
                //Confirm success
                notification.success("The user was deleted successfully");

                //Close the modal and update the users
                return self.setState({
                    users: new_users,
                    modal: {
                        show: false
                    }
                });
            });
    }

    render() {
        if (!this.props.user.admin) {
            return (
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
                        {/*Modal*/}
                        {this.renderModal()}
                    </div>
                );
        }
    }
}

export default Users;
