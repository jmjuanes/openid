import React from 'react';
import {Alert, Btn, Heading, Input, Label, Paragraph, Select, Spinner, Switch, Tag} from "neutrine";
import {Field, FieldHelper, FieldLabel} from "neutrine";
import {redirectHashbang as redirect} from "rouct";
import {request} from "@kofijs/request";

import Header from "../../../components/header/index.js";
import TableUsers from "../../../components/table_users/index.js";

import * as auth from "../../../commons/auth.js";
import * as notification from "../../../commons/notification.js";

import "./styles.scss";

//Users management component
export default class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "users": [],
            "loading": true,
            "modalVisible": false,
            "modalAction": null,
            "moadlLoading": false,
            "modalIndex": -1
        };
        //Referenced components
        this.ref = {
            "activeSwitch": React.createRef(),
            "roleSelect": React.createRef()
        };
        //Bind methods
        this.toggleModal = this.toggleModal.bind(this);
        this.handleUpdateUser = this.handleUpdateUser.bind(this);
        this.handleDeleteUser = this.handleDeleteUser.bind(this);
    }

    componentWillMount() {
        let self = this;
        let requestOptions = {
            "url": "/api/users",
            "method": "get",
            "json": true,
            "auth": auth.generateAuth()
        };
        //Import users data
        return request(requestOptions, function (error, res, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (res.statusCode >= 300) {
                return notification.error(body.message);
            }
            //Save the users list to the state
            return self.setState({"users": body.users, "loading": false});
        });
    }

    //Redirect to the register user route
    registerRedirect() {
        return redirect("/dashboard/users/new");
    }

    //Show the modal and set the user to display
    toggleModal(item, index, action) {
        //Check if modal is loading
        if (this.state.modalLoading === true) {
            return false;
        }
        //The user cannot delete himself
        if (item !== null) {
            if (this.props.user.id === item.id || (item.is_admin && !this.props.user.owner)) {
                return false;
            }
        }
        //Current modal visibility
        let currentStatus = this.state.modalVisible;
        //Update the modal state
        return this.setState({
            "modalVisible": !currentStatus, 
            "modalIndex": index, 
            "modalAction": action,
            "modalLoading": false
        });
    }

    //Edit the user information
    handleUpdateUser() {
        let self = this;
        //Get the current user information
        let user = this.state.users[this.state.modalIndex];
        let info = {
            "is_active": this.ref.activeSwitch.current.checked
        };
        //Check for owner
        if(this.props.user.owner === true){
            info.is_admin = this.ref.roleSelect.current.value === "admin";
        }
        //Check that a change has been made in the info to update
        let hasChanged = this.props.user.owner ? info.is_active !== user.is_active || info.is_admin !== user.is_admin : info.is_active !== user.is_active;
        if (hasChanged === false) {
            //No changes made --> close the modal
            //return notification.warning("Change the user info before updating")
            return this.setState({"modalVisible": false});
        }
        let requestOptions = {
            "url": "/api/users/" + user.id,
            "method": "put",
            "json": true,
            "body": info,
            "auth": auth.generateAuth()
        };
        //Do the request
        return request(requestOptions, function (err, res, body) {
            if (err) {
                notification.error(err.message);
                return self.setState({"modalLoading": false});
            }
            if (res.statusCode >= 300) {
                notification.error(body.message);
                return self.setState({"modalLoading": false});
            }
            //Update the state users array
            let newUsers = self.state.users;
            newUsers[self.state.modalIndex].is_admin = info.is_admin;
            newUsers[self.state.modalIndex].is_active = info.is_active;
            //Confirm success
            notification.success("User information updated");
            //Update the users array and close the modal
            return self.setState({
                "users": newUsers, 
                "modalVisible": false,
                "modalLoading": false
            });
        });
    }

    //Delete the user
    handleDeleteUser() {
        let self = this;
        return this.setState({"modalLoading": true}, function () {
            let userId = self.state.users[self.state.modalIndex].id;
            let requestOptions = { 
                "url": "/api/users/" + userId,
                "method": "delete",
                "json": true,
                "auth": auth.generateAuth()
            };
            //Do the request
            return request(requestOptions, function (err, res, body) {
                if (err) {
                    notification.error(err.message);
                    return self.setState({"modalLoading": false});
                }
                if (res.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"modalLoading": false});
                }
                //Delete the user from the array of users
                let newUsers = self.state.users;
                newUsers.splice(self.state.modalIndex, 1);
                //Confirm success
                notification.success("The user was deleted successfully");
                //Close the modal and update the users list
                return self.setState({
                    "users": newUsers, 
                    "modalVisible": false,
                    "modalLoading": false
                });
            });
        });
    }

    //Render a list with all the applications
    renderUsers() {
        if (this.state.loading === true) {
            return (<Spinner color="primary" style={{"marginTop":"25px"}}/>);
        }
        let customTitle = function (item) {
            return item.name;
        };
        let customDetail = function (item) {
            return item.email;
        };
        // Render the table
        return (
            <div className="users-list">
                <Paragraph>
                    There are <strong>{this.state.users.length}</strong> users registered.
                </Paragraph>
                <TableUsers data={this.state.users}
                    icon="user"
                    admin={this.props.user}
                    editUser={this.toggleModal}
                    customTitle={customTitle}
                    customDetail={customDetail}/>
            </div>
        );
    }

    //Render the user role selector --> only visible for owners
    renderModalRole() {
        if (this.props.user.owner === true) {
            //Get the role of the user 
            let user = this.state.users[this.state.modalIndex];
            let role = (user.is_admin === true) ? "admin" : "user";
            return (
                <Field>
                    <Label>Role of the user: </Label>
                    <Select defaultValue={role} ref={this.ref.roleSelect}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </Select>
                    <FieldHelper>
                        An <strong>administrator</strong> can register and edit applications and users, but can not change the role of a user.
                    </FieldHelper>
                </Field>
            );
        }
    }

    //Render the submit section for user update
    renderModalUpdateSubmit() {
        if (this.state.modalLoading === true) {
            return <Spinner color="primary"/>;
        }
        else {
            return <Btn color="primary" fluid onClick={this.handleUpdateUser}>Update user</Btn>;
        }
    }

    //Render the submit section for user delete
    renderModalDeleteSubmit() {
        if (this.state.modalLoading === true) {
            return <Spinner color="primary"/>;
        }
        else {
            return <Btn color="error" fluid onClick={this.handleDeleteUser}>Delete user</Btn>;
        }
    }

    //Render the modal to delete the application
    renderModal() {
        if (this.state.modalVisible) {
            if (this.state.modalAction === "edit") {
                let user = this.state.users[this.state.modalIndex];
                return (
                    <div className="modal">
                        <div className={"modal-content"}>
                            <span className="modal-hide" onClick={() => this.toggleModal(null, null, null)}>&times;</span>
                            <Heading type={"h4"} className={"modal-title"}>Edit user</Heading>
                            <Paragraph>Make the desired changes in the user and click <b>Update user</b> to confirm them.</Paragraph>
                            <Field>
                                <Label>User active: </Label>
                                <Switch defaultChecked={user.is_active} ref={this.ref.activeSwitch}/>
                                <FieldHelper>
                                    If you deactivate the user, he will not be able to log in until he is activated again.
                                </FieldHelper>
                            </Field>
                            {this.renderModalRole()}
                            {this.renderModalUpdateSubmit()}
                        </div>
                    </div>
                );
            }
            else if (this.state.modalAction === "delete") {
                return (
                    <div className="modal">
                        <div className={"modal-content"}>
                            <span className="modal-hide" onClick={() => this.toggleModal(null, null, null)}>&times;</span>
                            <Heading type={"h4"} className={"modal-title"}>Are you sure?</Heading>
                            <Paragraph>
                                Once you delete this user all his data will be permanently lost,
                                and the only way he'll be able to use the application again will be by creating a new
                                account.
                            </Paragraph>
                            {this.renderModalDeleteSubmit()}
                        </div>
                    </div>
                );
            }
        }
    }

    render() {
        //Check if logged user is not an administrator
        if (this.props.user.admin === false) {
            return <Alert color="error">You must be an administrator to access this route.</Alert>;
        }
        return (
            <div className="users-content">
                <Header text="Users" btnText="New user" onBtnClick={() => this.registerRedirect()}/>
                {this.renderUsers()}
                {/*Modal*/}
                {this.renderModal()}
            </div>
        );
    }
}

