import React from "react";
import {Field, FieldHelper, FieldLabel, Heading, Input, Spinner} from "neutrine";
import {request} from "neutrine-utils";

import "./styles.scss";

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {
                name: "",
                email: ""
            }
        };
    }

    // Get the user info using his access token
    componentDidMount() {
        let self = this;
        let author_header = "Bearer " + this.props.token;

        request({url: "/api/user", method: "get", json: true, headers: {Authorization: author_header, "Content-Type": "application/json"}},
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
                        email: body.email
                        // is active and admin still not here
                    }
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
                    {/*User info*/}
                    <div className={"profile-form"}>
                        {/*Name input*/}
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            <Input className="login-input"
                                   type={"text"}
                                   value={this.state.user.name}
                                   required/>
                        </Field>
                        {/*Email input*/}
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input className="login-input"
                                   type={"text"}
                                   value={this.state.user.email}
                                   required/>
                            <FieldHelper>Email used to log in the application</FieldHelper>
                        </Field>
                    </div>
                </div>
            );
    }
}

export default Profile;