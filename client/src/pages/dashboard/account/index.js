import React from "react";
import {request} from "@kofijs/request";
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Paragraph, Small, Spinner} from "neutrine";
import {redirectHashbang as redirect} from "rouct";

import * as auth from "../../../commons/auth.js";
import * as notification from "../../../commons/notification.js";

//Export account class
export default class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "loading": false,
            "modalVisible": false,
            "modalLoading": false
        };
        this.ref = {
            "oldPwd": React.createRef(),
            "newPwd1": React.createRef(),
            "newPwd2": React.createRef(),
            "deleteEmail": React.createRef(),
            "deleteText": React.createRef(),
            "deletePwd": React.createRef()
        };
        this.text_confirm = "Yes, delete my account";
        // Bind functions
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.handleAccountDelete = this.handleAccountDelete.bind(this);
        this.renderModalSubmit = this.renderModalSubmit.bind(this);
        this.renderSubmit = this.renderSubmit.bind(this);
    }

    //Show or hide the modal
    toggleModal() {
        //Check if modal is loading
        if (this.state.modalLoading === false) {
            let current = !this.state.modalVisible;
            return this.setState({"modalVisible": current, "modalLoading": false});
        }
    }

    //Update the user password
    handleSubmit() {
        let self = this;
        let data = {
            "old_pwd": this.ref.oldPwd.current.value,
            "new_pwd": this.ref.newPwd1.current.value,
            "repeat_pwd": this.ref.newPwd2.current.value
        };
        //Check for valid passwords
        if (data.new_pwd !== data.repeat_pwd) {
            return notification.error("Passwords do not match");
        }
        if (data.new_pwd.length < 6) {
            return notification.error("Please use a 6 character password");
        }
        if (data.new_pwd === data.old_pwd) {
            return notification.error("New and old passwords cannot be the same");
        }
        return self.setState({"loading": true}, function () {
            let requestOptions = {
                "url": "/api/user",
                "method": "put",
                "json": true,
                "body": data,
                "auth": auth.generateAuth()
            };
            //Update the user password
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"loading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"loading": false});
                }
                //Reset the password values
                self.ref.oldPwd.current.value = "";
                self.ref.newPwd1.current.value = "";
                self.ref.repeatPwd2.current.value = "";
                //Display success and hide the loading
                notification.success("Password updated successfully");
                return self.setState({"loading": false});
            });
        });
    }

    //Delete the account
    handleAccountDelete() {
        let self = this;
        let data = {
            "email": this.ref.deleteEmail.current.value,
            "text": this.ref.deleteText.current.value,
            "pwd": this.ref.deletePwd.current.value
        };
        if (data.text !== this.text_confirm) {
            return notification.error("Type the exact confirmation text");
        }
        if (data.email.indexOf("@") === -1) {
            return notification.error("Enter a valid email");
        }
        if (data.pwd.length < 6) {
            return notification.error("Enter a valid password");
        }
        return self.setState({"modalLoading": true}, function () {
            let requestOptions = {
                "url": "/api/user/delete",
                "method": "post",
                "json": true,
                "body": data,
                "auth": auth.generateAuth()
            };
            //Delete the account
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"modalLoading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"modalLoading": false});
                }
                //Delete the token and redirect to the login window
                auth.deleteToken();
                return redirect("/login");
            });
        });
    }

    //Render the delete button/spinner of the modal
    renderModalSubmit() {
        if (this.state.modalLoading === true) {
            return <Spinner color="error"/>;
        }
        else {
            return <Btn color="error" fluid  onClick={this.handleAccountDelete}>Delete my account</Btn>;
        }
    }

    //Render the modal to delete the account
    renderModal() {
        if (this.state.modalVisible) {
            return (
                <div className="pf-modal">
                    <div className="pf-modal-content">
                        <span className="pf-modal-hide" onClick={this.toggleModal}>&times;</span>
                        <Heading type="h4" className="pf-modal-title">Are you sure?</Heading>
                        <Paragraph>
                            After you confirm this action we will delete permanently all your
                            information from our database. You'll have to create a new account to access this
                            application again.</Paragraph>
                        <Field>
                            <FieldLabel>Your email</FieldLabel>
                            <Input fluid type="text" ref={this.ref.deleteEmail}/>
                        </Field>
                        <Field>
                            <FieldLabel>Verify this action by typing <strong>{this.text_confirm}</strong> below</FieldLabel>
                            <Input fluid type="text" ref={this.ref.deleteText}/>
                        </Field>
                        <Field>
                            <FieldLabel>Your password</FieldLabel>
                            <Input fluid type="password" ref={this.ref.deletePwd}/>
                        </Field>
                        {/*Render the button or if it's loading the spinner*/}
                        {this.renderModalSubmit()}
                    </div>
                </div>
            );
        }
    }

    //Render the submit button or the loading spinner
    renderSubmit() {
        if (this.state.loading === true) {
            return <Spinner color="primary"/>;
        }
        else {
            return <Btn color="primary" onClick={this.handleSubmit}>Update password</Btn>;
        }
    }

    render() {
        return (
            <div>
                {this.renderModal()}
                <Header text="Change password"></Header>
                {/*Old pass input*/}
                <Field>
                    <FieldLabel>Old password</FieldLabel>
                    <Input type="password" fluid ref={this.ref.oldPwd}/>
                </Field>
                {/*New pass input*/}
                <Field>
                    <FieldLabel>New password</FieldLabel>
                    <Input type="password" fluid ref={this.ref.newPwd1}/>
                    <FieldHelper>Minimum 6 characters</FieldHelper>
                </Field>
                {/*Repeat pass input*/}
                <Field>
                    <FieldLabel>Confirm new password</FieldLabel>
                    <Input type="password" fluid ref={this.ref.repeatPwd2}/>
                </Field>
                {this.renderSubmit()}
                <Header text="Delete account"></Header>
                <Paragraph>
                    Once you delete your account you can't get it back. Be certain about your decision.
                </Paragraph>
                <Btn color="error" onClick={this.toggleModal}>Delete my account</Btn>
            </div>
        );
    }
}

