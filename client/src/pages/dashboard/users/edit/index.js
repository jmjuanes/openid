import React, {Component} from 'react';
import {Alert, Btn, Field, FieldLabel, Heading, Input, Paragraph, Spinner} from "neutrine";
import {request} from "@kofijs/request";
import {redirectHashbang as redirect} from "rouct";

import "./styles.scss";

class EditUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            error: null,
            ready: false,
            done: null,
            modal: {
                show: false
            }
        };
        this.ref = {
            isActiveInput: React.createRef(),
            nameInput: React.createRef()
        };

        this.renderModal = this.renderModal.bind(this);
        this.showModal = this.showModal.bind(this);

        this.renderAlert = this.renderAlert.bind(this);
        this.handleUserDelete = this.handleUserDelete.bind(this);
        this.updateUser = this.updateUser.bind(this);
    }

    componentWillMount() {
        let self = this;
        // Get the id from the params object of the request
        let url = "/api/users/" + this.props.request.params.id;
        request({
            url: url,
            method: "get",
            json: true,
            auth: {bearer: localStorage.getItem("token")}
        }, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message, done: null});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message, done: null});
            }
            self.setState({
                user: {
                    id: self.props.request.params.id,
                    name: body.name,
                    email: body.email,
                    is_active: body.is_active
                },
                ready: true
            });
        });
    }

    // Render the alert if there's an error
    renderAlert() {
        if (this.state.error) {
            return (
                <Alert color={"red"}>{this.state.error}</Alert>
            );
        } else if (this.state.done) {
            return (
                <Alert color={"green"}>{this.state.done}</Alert>
            );
        }
    }

    // Show or hide the modal
    showModal() {
        this.setState({
            modal: {
                show: !this.state.modal.show
            }
        });
    }

    // Render the modal to delete the user
    renderModal() {
        if (this.state.modal.show) {
            return (
                <div className="modal">
                    <div className={"modal-content"}>
                        <span className="modal-hide" onClick={() => this.showModal()}>&times;</span>
                        <Heading type={"h4"} className={"modal-title"}>Are you sure?</Heading>
                        <p className="p-small">Once you delete this user from the database his information won't be
                            available again, and the only way for him to access the application will be to create a new
                            account.</p>
                        <Btn color={"red"}
                             fluid
                             onClick={this.handleUserDelete}>Delete user</Btn>
                    </div>
                </div>
            );
        }
    }

    handleUserDelete() {
        console.log("Delete");
        // let self = this;
        // let url = "/api/users/" + this.state.user.id;
        // request({url: url, method: "delete", json: true, auth: {bearer: localStorage.getItem("token")}}, function (err, res, body) {
        //     if (err) {
        //         return self.setState({modal: {error: err.message, show: true, disableBtn: false}});
        //     }
        //     if (res.statusCode >= 300) {
        //         return self.setState({modal: {error: body.message, show: true, disableBtn: false}});
        //     }
        //     return redirect("/dashboard/users");
        // });
    }

    // Update the user info
    updateUser() {
        let self = this;
        let info = {
            is_active: this.ref.detailInput.current.value
        };

        let url = "/api/user/" + this.props.request.params.id;
        request({
            url: url,
            method: "put",
            json: true,
            body: info,
            auth: {bearer: localStorage.getItem("token")}
        }, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message, done: null});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message, done: null});
            }
            // Set the new info
            return self.setState({
                user: {
                    id: self.props.request.params.id,
                    name: self.state.name,
                    email: self.state.email,
                    is_active: body.is_active
                },
                done: "User information successfully updated",
                error: null
            });
        });
    }

    render() {
        if (!this.props.admin) {
            return (
                <Alert color={"red"}>You must be an administrator to access this route.</Alert>
            );
        }
        else {
            if (!this.state.ready) {
                return (
                    <Spinner/>
                );
            }
            else
                return (
                    <div className={"edit-user-content"}>
                        {/*Modal to delete a user*/}
                        {this.renderModal()}
                        {/*Title*/}
                        <Heading type={"h2"}>User {this.state.user.name}</Heading>
                        {/*Edit form*/}
                        {/*Form title*/}
                        <Heading type={"h5"}>Manage the user information</Heading>
                        <div className="edit-user-form">
                            {/*Done/error message*/}
                            {this.renderAlert()}
                            {/*Name input*/}
                            <Field>
                                <FieldLabel>User name</FieldLabel>
                                <Input className="edit-user-input"
                                       type={"text"}
                                       fluid
                                       readOnly
                                       defaultValue={this.state.user.name}
                                       ref={this.ref.nameInput}/>
                            </Field>
                            {/*Email input*/}
                            <Field>
                                <FieldLabel>User email</FieldLabel>
                                <Input className="edit-user-input"
                                       type={"text"}
                                       fluid
                                       readOnly
                                       defaultValue={this.state.user.email}/>
                            </Field>
                            {/*Is active checkbox*/}
                            <Field>
                                <FieldLabel>Active user</FieldLabel>
                                <Input className="edit-user-input"
                                       type={"checkbox"}
                                       fluid
                                       defaultValue={this.state.user.is_active}
                                       ref={this.ref.redirectInput}/>
                            </Field>
                            <Btn color={"blue"}
                                // onClick={this.updateUser}
                            >Update user</Btn>
                        </div>
                        {/*Delete user*/}
                        <div className="edit-user-delete">
                            <Heading type={"h5"}>Delete the user</Heading>
                            <Paragraph>Once the user is deleted all his data will be lost.
                            </Paragraph>
                            <Btn color={"grey"} className={"btn"} onClick={this.showModal}>Delete user</Btn>
                        </div>
                    </div>
                );
        }
    }
}

export default EditUser;
