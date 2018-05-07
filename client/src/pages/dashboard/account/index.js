import React from "react";
import {request} from "@kofijs/request";
import {Alert, Btn, Field, FieldLabel, Heading, Input, Small} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import "./styles.scss";

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            done: null,
            modal: {
                show: false,
                error: null
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
        this.renderError = this.renderError.bind(this);
        this.renderErrorModal = this.renderErrorModal.bind(this);
        this.showModal = this.showModal.bind(this);
        this.handleAccountDelete = this.handleAccountDelete.bind(this);
    }

    // Display the error message
    renderError() {
        if (this.state.error) {
            return (
                <Alert color={"red"} className={"account-error"}>
                    {this.state.error}
                </Alert>
            )
        }
    }

    // Display the modal error message
    renderErrorModal() {
        if (this.state.modal.error) {
            return (
                <Alert color={"red"} className={"modal-error"}>
                    {this.state.modal.error}
                </Alert>
            )
        }
    }

    // Display the success message
    renderDone() {
        if (this.state.done) {
            return (
                <Alert color={"green"} className={"profile-done"}>
                    {this.state.done}
                </Alert>
            );
        }
    }

    // Render the modal to delete the account
    renderModal() {
        if (this.state.modal.show) {
            return (
                <div className="account-modal">
                    <div className={"account-modal-content"}>
                        <span className="account-modal-hide" onClick={this.showModal}>&times;</span>
                        <Heading type={"h4"} className={"account-modal-title"}>Are you sure?</Heading>
                        {this.renderErrorModal()}
                        <p className="siimple-p">After you confirm this action we will delete permanently all your
                            information from our database. You'll have to create a new account to access this
                            application
                            again.</p>
                        <Field>
                            <FieldLabel>Your email</FieldLabel>
                            <Input className="account-input"
                                   type={"text"}
                                   inputRef={this.ref.deleteEmail}/>
                        </Field>
                        <Field>
                            <FieldLabel>Verify this action by typing <i>{this.text_confirm}</i> below</FieldLabel>
                            <Input className="account-input"
                                   type={"text"}
                                   inputRef={this.ref.deleteText}/>
                        </Field>
                        <Field>
                            <FieldLabel>Your password</FieldLabel>
                            <Input className="account-input"
                                   type={"password"}
                                   inputRef={this.ref.deletePwd}/>
                        </Field>
                        <Btn color={"red"} onClick={this.handleAccountDelete}>Delete my account</Btn>
                    </div>
                </div>
            );
        }
    }

    // Show or hide the modal
    showModal() {
        this.setState({modal: {
            show: !this.state.modal.show,
            error: null
        }});
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
            return this.setState({error: "Passwords do not match", done: null});
        }
        if (credentials.new_pwd.length < 6) {
            return this.setState({error: "Please use a 6 characters passwords", done: null});
        }
        if (credentials.new_pwd === credentials.old_pwd) {
            return this.setState({error: "New and old passwords cannot be the same", done: null})
        }

        request({
                url: "/api/user/password",
                method: "put",
                json: true,
                body: credentials,
                auth: {bearer: this.props.token}
            },
            function (err, res, body) {
                if (err) {
                    return self.setState({error: err.message, done: null});
                }
                if (res.statusCode >= 300) {
                    return self.setState({error: body.message, done: null});
                }
                self.ref.oldPwdInput.current.value = "";
                self.ref.newPwdInput.current.value = "";
                self.ref.repeatPwdInput.current.value = "";
                return self.setState({done: "Password updated successfully", error: null});
            });
    }

    handleAccountDelete() {
        let self = this;
        let info = {
            email: this.ref.deleteEmail.current.value,
            text: this.ref.deleteText.current.value,
            pwd: this.ref.deletePwd.current.value
        };
        if (info.text !== this.text_confirm) {
            this.setState({modal: {show: true, error: "Please, type the exact confirmation text"}});
        }
        if (info.email.indexOf("@") === -1) {
            this.setState({modal: {show: true, error: "Enter a valid email"}});
        }
        if (info.pwd.length < 6) {
            this.setState({modal: {show: true, error: "Enter a valid password"}});
        }
        request({
                url: "/api/user",
                method: "delete",
                json: true,
                body: info,
                auth: {bearer: this.props.token}
            },
            function (err, res, body) {
                if (err) {
                    return self.setState({modal: {show: true, error: err.message}});
                }
                if (res.statusCode >= 300) {
                    return self.setState({modal: {show: true, error: body.message}});
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
                    {/*Done message*/}
                    {this.renderDone()}
                    {/*Error message*/}
                    {this.renderError()}
                    {/*Change password*/}
                    <div className="account-password-form">
                        <Heading type={"h4"}>Change password</Heading>
                        {/*Old pass input*/}
                        <Field>
                            <FieldLabel>Old password</FieldLabel>
                            <Input className="account-input"
                                   type={"password"}
                                   inputRef={this.ref.oldPwdInput}/>
                        </Field>
                        {/*New pass input*/}
                        <Field>
                            <FieldLabel>New password</FieldLabel>
                            <Input className="account-input"
                                   type={"password"}
                                   inputRef={this.ref.newPwdInput}/>
                        </Field>
                        {/*Repeat pass input*/}
                        <Field>
                            <FieldLabel>Confirm new password</FieldLabel>
                            <Input className="account-input"
                                   type={"password"}
                                   inputRef={this.ref.repeatPwdInput}/>
                        </Field>
                        {/*Update password button*/}
                        <Btn color={"blue"} onClick={this.handlePwdUpdate}>Update password</Btn>
                    </div>
                    {/*Delete account*/}
                    <div className="account-delete">
                        <Heading type={"h4"}>Delete account</Heading>
                        <Small>Once you delete your account you can't get it back. Be certain about your
                            decision.</Small>
                        <Btn color={"grey"} className={"btn"} onClick={this.showModal}>Delete my account</Btn>
                    </div>
                </div>
            </div>
        );
    }
}

export default Account;