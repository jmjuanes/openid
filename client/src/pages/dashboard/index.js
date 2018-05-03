import React from "react";
import * as Router from "rouct";

import "./styles.scss";
import Profile from "./profile/index";
import {List, ListItem, ListTitle, Spinner} from "neutrine";
import {request} from "neutrine-utils";

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            user: {}
        }
    }

    // Get the user info using his access token
    componentDidMount() {
        // Change to dashboard
        let self = this;
        // let author_header = "Bearer " + this.props.token;

        request({
            url: "/api/user",
            method: "get",
            json: true,
            auth: {bearer: this.props.token}
        }, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message});
            }
            return self.setState({
                user: {
                    id: body.id
                },
                ready: true
            });
        });
    }

    render() {
        if (this.state.ready === false) {
            return (
                <Spinner className={"dash-loading"}/>
            );
        }
        else
            return (
                <div className="siimple-content siimple-content--medium">
                    <div className="siimple-grid">
                        <div className="siimple-grid-row">
                            {/*Side menu*/}
                            <div className="dash-menu siimple-grid-col siimple-grid-col--3">
                                {/*User panel*/}
                                <List>
                                    <ListItem>Profile</ListItem>
                                    <ListItem>Authorised apps</ListItem>
                                    <ListItem>Change password</ListItem>
                                    <ListItem>Delete account</ListItem>
                                </List>
                            </div>
                            {/*Content*/}
                            <div className="dash-content siimple-grid-col siimple-grid-col--9">
                                <Router.Switch>
                                    <Router.Route exact path={"/dashboard/"}
                                                  component={Profile}
                                                  props={{token: this.props.token}}/>
                                </Router.Switch>
                            </div>
                        </div>
                    </div>
                </div>
            );
    }

}

export default Dashboard;