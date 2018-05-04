import React from "react";
import * as Router from "rouct";
import {List, ListItem, ListTitle, Spinner} from "neutrine";
import {request} from "@kofijs/request";

import Account from "./account/index";
import Profile from "./profile/index";
import "./styles.scss";

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            user: {}
        };

        this.dashboardRedirect = this.dashboardRedirect.bind(this);
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

    // Left panel redirects
    dashboardRedirect(path) {
        Router.redirectHashbang("/dashboard/" + path);
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
                                    <ListItem onClick={() => {this.dashboardRedirect("")}}>Profile</ListItem>
                                    <ListItem onClick={() => {this.dashboardRedirect("account")}}>Account</ListItem>
                                    <ListItem>Email</ListItem>
                                    <ListItem>Authorized apps</ListItem>
                                </List>
                            </div>
                            {/*Content*/}
                            <div className="dash-content siimple-grid-col siimple-grid-col--9">
                                <Router.Switch>
                                    <Router.Route exact path={"/dashboard/"}
                                                  component={Profile}
                                                  props={{token: this.props.token}}/>
                                    <Router.Route exact path={"/dashboard/account"}
                                                  component={Account}
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