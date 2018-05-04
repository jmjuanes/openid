import React from "react";
import {request} from "neutrine-utils";
import {Alert, Btn, Field, FieldLabel, Heading, Input} from "neutrine";

import "./styles.scss";

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            done: null
        };
        this.ref = {
            oldPwdInput: React.createRef(),
            newPwdInput: React.createRef(),
            repeatPwdInput: React.createRef()
        };
        this.handlePwdUpdate = this.handlePwdUpdate.bind(this);
        this.renderError = this.renderError.bind(this);
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
        if(credentials.new_pwd === credentials.old_pwd){
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

    render() {
        return (
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
            </div>
        );
    }
}

export default Account;