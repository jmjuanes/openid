import React from "react";
import {Alert, Btn, Field, FieldHelper, FieldLabel, Heading, Input, Spinner} from "neutrine";
import {request} from "neutrine-utils";

import "./styles.scss";

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            error: null,
            done: null
        };
        this.ref = {
            nameInput: React.createRef()
        };

        this.handleInfoChange = this.handleInfoChange.bind(this);
        this.renderError = this.renderError.bind(this);
        this.renderDone = this.renderDone.bind(this);
    }

    // Get the user info using his access token
    componentDidMount() {
        // Change to dashboard
        let self = this;

        request({url: "/api/user", method: "get", json: true, auth: {bearer: this.props.token}},
            function (err, res, body) {
                if (err) {
                    return self.setState({error: err.message});
                }
                if (res.statusCode >= 300) {
                    return self.setState({error: body.message});
                }
                return self.setState({
                    user: {
                        name: body.name,
                        email: body.email,
                        id: body.id
                    }
                });
            });
    }

    // Display the error message
    renderError() {
        if (this.state.error) {
            return (
                <Alert color={"red"} className={"profile-error"}>
                    {this.state.error}
                </Alert>
            )
        }
    }

    // Display the success message
    renderDone(){
        if(this.state.done){
            return(
                <Alert color={"green"} className={"profile-done"}>
                    {this.state.done}
                </Alert>
            );
        }
    }

    // Updates the user's information
    handleInfoChange() {
        let self = this;
        let credentials = {
            name: this.ref.nameInput.current.value
        };
        if (credentials.name === this.state.user.name) {
            return this.setState({error: "Change the info before submitting", done: null});
        }

        let url = "/api/users/" + this.state.user.id;
        console.log("The id is: " + this.state.user.id);
        request({url: url, method: "put", json: true, body: credentials}, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message, done: null});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message, done: null});
            }
            return self.setState({
                // React only respects the 1st level: update the whole user
                user: {
                    name: body.name,
                    id: self.state.user.id,
                    email: self.state.user.email
                },
                error: null,
                done: "Information updated successfully"
            });
        });
    }


    render() {
        if (this.state.user === null) {
            return (
                <Spinner className={"profile-loading"}/>
            );
        } else
            return (
                <div className={"profile-content"}>
                    {/*Title*/}
                    <Heading type={"h2"}>Profile</Heading>
                    {/*Done message*/}
                    {this.renderDone()}
                    {/*Error message*/}
                    {this.renderError()}
                    {/*User info*/}
                    <div className={"profile-form"}>
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input className="login-input"
                                   type={"text"}
                                   defaultValue={this.state.user.name}
                                   inputRef={this.ref.nameInput}/>
                        </Field>
                        {/*Email input*/}
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input className="login-input"
                                   type={"text"}
                                   defaultValue={this.state.user.email}
                                   readOnly/>
                            <FieldHelper>Email used to log in the application</FieldHelper>
                        </Field>
                    </div>
                    {/*Update info*/}
                    <Btn color={"blue"} onClick={this.handleInfoChange}>Update info</Btn>
                </div>
            );
    }
}

export default Profile;