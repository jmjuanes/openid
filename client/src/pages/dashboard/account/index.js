import React from "react";
import {request} from "@kofijs/request";
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Paragraph, Small, Spinner} from "neutrine";
import {redirectHashbang as redirect} from "rouct";
import * as notification from "../../../commons/notification.js";

import "./styles.scss";

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: {
                show: false,
                disableBtn: false
            }
        };
        this.ref = {
            oldPwdInput: React.createRef(),
            newPwdInput: React.createRef(),
            repeatPwdInput: React.createRef(),
            deleteEmail: React.createRef(),
            deleteText: React.createRef(),
            deletePwd: React.createRef()
        };
        this.text_confirm = "Yes, delete my account";

        // Bind functions
        this.handlePwdUpdate = this.handlePwdUpdate.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.showModal = this.showModal.bind(this);
        this.handleAccountDelete = this.handleAccountDelete.bind(this);
        this.spinnerButton = this.spinnerButton.bind(this);
    }

    // Render the delete button/spinner
    spinnerButton() {
        if (!this.state.modal.disableBtn) {
            return (
                <Btn color={"red"} fluid style={{marginTop: "10px"}} onClick={this.handleAccountDelete}>Delete my account</Btn>
            );
        } else {
            return (
                <Spinner/>
            );
        }
    }

    // Show or hide the modal
    showModal() {
        this.setState({
            modal: {
                show: !this.state.modal.show,
                disableBtn: false
            }
        });
    }


    // Render the modal to delete the account
    renderModal() {
        if (this.state.modal.show) {
            return (
                <div className="modal">
                    <div className={"modal-content"}>
                        <span className="modal-hide" onClick={this.showModal}>&times;</span>
                        <Heading type={"h4"} className={"modal-title"}>Are you sure?</Heading>
                        <p className="siimple-p">After you confirm this action we will delete permanently all your
                            information from our database. You'll have to create a new account to access this
                            application
                            again.</p>
                        <Field>
                            <FieldLabel>Your email</FieldLabel>
                            <Input className="modal-input"
                                   type={"text"}
                                   ref={this.ref.deleteEmail}/>
                        </Field>
                        <Field>
                            <FieldLabel>Verify this action by typing <i>{this.text_confirm}</i> below</FieldLabel>
                            <Input className="modal-input"
                                   type={"text"}
                                   ref={this.ref.deleteText}/>
                        </Field>
                        <Field>
                            <FieldLabel>Your password</FieldLabel>
                            <Input className="modal-input"
                                   type={"password"}
                                   ref={this.ref.deletePwd}/>
                        </Field>
                        {/*Render the button or if it's loading the spinner*/}
                        {this.spinnerButton()}
                    </div>
                </div>
            );
        }
    }

    // Update the user password
    handlePwdUpdate() {
        let self = this;
        let credentials = {
            old_pwd: this.ref.oldPwdInput.current.value,
            new_pwd: this.ref.newPwdInput.current.value,
            repeat_pwd: this.ref.repeatPwdInput.current.value
        };
        if (credentials.new_pwd !== credentials.repeat_pwd) {
            return notification.warning("Passwords do not match");
        }
        if (credentials.new_pwd.length < 6) {
            return notification.warning("Please use a 6 character password");
        }
        if (credentials.new_pwd === credentials.old_pwd) {
            return notification.warning("New and old passwords cannot be the same");
        }

        request({
                url: "/api/user",
                method: "put",
                json: true,
                body: credentials,
                auth: {bearer: localStorage.getItem("token")}
            },
            function (err, res, body) {
                if (err) {
                    return notification.error(err.message);
                }
                if (res.statusCode >= 300) {
                    return notification.error(body.message);
                }
                self.ref.oldPwdInput.current.value = "";
                self.ref.newPwdInput.current.value = "";
                self.ref.repeatPwdInput.current.value = "";
                return notification.success("Password updated successfully");
            });
    }

    handleAccountDelete() {
        this.setState({modal: {show: true, disableBtn: true}});
        let self = this;
        let info = {
            email: this.ref.deleteEmail.current.value,
            text: this.ref.deleteText.current.value,
            pwd: this.ref.deletePwd.current.value
        };
        if (info.text !== this.text_confirm) {
            this.setState({modal: {show: true, disableBtn: false}});
            return notification.warning(("Type the exact confirmation text"))
        }
        if (info.email.indexOf("@") === -1) {
            this.setState({modal: {show: true, disableBtn: false}});
            return notification.warning("Enter a valid email");
        }
        if (info.pwd.length < 6) {
            this.setState({modal: {show: true, disableBtn: false}});
            return notification.warning("Enter a valid password");
        }
        request({
                url: "/api/user/delete",
                method: "post",
                json: true,
                body: info,
                auth: {bearer: localStorage.getItem("token")}
            },
            function (err, res, body) {
                if (err) {
                    self.setState({modal: {show: true, disableBtn: false}});
                    return notification.error(err.message);
                }
                if (res.statusCode >= 300) {
                    self.setState({modal: {show: true, disableBtn: false}});
                    return notification.error(body.message);
                }
                return redirect("/login");
            });
    }

    render() {
        return (
            <div className={"account-container"}>
                {/*Modal to confirm the account deletion*/}
                {this.renderModal()}
                <div className="account-content">
                    {/*Title*/}
                    <Heading type={"h2"}>Account</Heading>
                    {/*Change password*/}
                    <div className="account-password-form">
                        <Heading type={"h5"}>Change password</Heading>
                        {/*Old pass input*/}
                        <Field>
                            <FieldLabel>Old password</FieldLabel>
                            <Input className="account-input"
                                   type={"password"}
                                   fluid={true}
                                   ref={this.ref.oldPwdInput}/>
                        </Field>
                        {/*New pass input*/}
                        <Field>
                            <FieldLabel>New password</FieldLabel>
                            <Input className="account-input"
                                   type={"password"}
                                   fluid={true}
                                   ref={this.ref.newPwdInput}/>
                            <FieldHelper>Minimum 6 characters</FieldHelper>
                        </Field>

                        {/*Repeat pass input*/}
                        <Field>
                            <FieldLabel>Confirm new password</FieldLabel>
                            <Input className="account-input"
                                   type={"password"}
                                   fluid={true}
                                   ref={this.ref.repeatPwdInput}/>
                        </Field>
                        {/*Update password button*/}
                        <Btn color={"blue"} onClick={this.handlePwdUpdate}>Update password</Btn>
                    </div>
                    {/*Delete account*/}
                    <div className="account-delete">
                        <Heading type={"h4"}>Delete account</Heading>
                        <Paragraph>Once you delete your account you can't get it back. Be certain about
                            your decision.</Paragraph>
                        <Btn color={"red"} className={"btn"} onClick={this.showModal}>Delete my account</Btn>
                    </div>
                </div>
            </div>
        );
    }
}

export default Account;