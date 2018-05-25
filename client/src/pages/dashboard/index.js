import React from "react";
import * as Router from "rouct";
import {Btn, List, ListItem, ListTitle, Spinner, Small} from "neutrine";
import {Navbar, NavbarTitle, NavbarSubtitle, NavbarItem} from "neutrine";
import {request} from "@kofijs/request";

import Account from "./account/index";
import Profile from "./profile/index";
import "./styles.scss";
import Applications from "./applications/index";
import EditApp from "./applications/edit/index";
import CreateApp from "./applications/create/index";
import Users from "./users/index";


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            user: {}
        };

        this.dashboardRedirect = this.dashboardRedirect.bind(this);
        this.renderAdminPanel = this.renderAdminPanel.bind(this);
    }

    // Get the user info using his access token
    componentDidMount() {
        // If there's no access token, redirect to login
        if (localStorage.getItem("token") === null) {
            return Router.redirectHashbang("/login");
        }
        let self = this;
        request({
            url: "/api/user",
            method: "get",
            json: true,
            auth: {bearer: localStorage.getItem("token")}
        }, function (err, res, body) {
            if (err) {
                return self.setState({error: err.message});
            }
            if (res.statusCode >= 300) {
                return self.setState({error: body.message});
            }
            return self.setState({
                user: {
                    id: body.id,
                    admin: body.is_admin,
                    owner: body.is_owner
                },
                ready: true
            });
        });
    }

    // Left panel redirects
    dashboardRedirect(path) {
        Router.redirectHashbang("/dashboard/" + path);
    }

    // Show the admin routes if the user is admin
    renderAdminPanel() {
        if (this.state.user.admin) {
            return (
                <List>
                    <ListItem className={"dash-menu-item"} onClick={() => {
                        this.dashboardRedirect("applications");
                    }}>
                        <ListTitle style={{marginBottom: "0px"}}>Applications</ListTitle>
                        <Small>Manage all the registered applications</Small>
                    </ListItem>
                    <ListItem className={"dash-menu-item"} onClick={() => {
                        this.dashboardRedirect("users");
                    }}>
                        <ListTitle style={{marginBottom: "0px"}}>Users</ListTitle>
                        <Small>Manage all the registered users</Small>
                    </ListItem>
                </List>
            );
        }
    }

    render() {
        if (this.state.ready === false) {
            return (
                <Spinner className={"dash-loading"}/>
            );
        }
        else
            return (
                <div>
                    <Navbar size="medium" color="light">
                        <NavbarTitle>OpenID</NavbarTitle>
                        <NavbarSubtitle>Dashboard</NavbarSubtitle>
                        <NavbarItem style={{"float": "right"}}
                                    onClick={() => this.props.deleteToken()}>Log out</NavbarItem>
                    </Navbar>
                    <div className="siimple-content siimple-content--medium">
                        <div className="siimple-grid">
                            <div className="siimple-grid-row">
                                {/*Side menu*/}
                                <div className="dash-menu siimple-grid-col siimple-grid-col--3">
                                    {/*User panel*/}
                                    <div className="dash-menu-list">
                                        <List>
                                            <ListItem className={"dash-menu-item"} onClick={() => {
                                                this.dashboardRedirect("");
                                            }}>
                                                <ListTitle style={{marginBottom: "0px"}}>Profile</ListTitle>
                                                <Small>Edit your personal info</Small>
                                            </ListItem>
                                            <ListItem className={"dash-menu-item"} onClick={() => {
                                                this.dashboardRedirect("account");
                                            }}>
                                                <ListTitle style={{marginBottom: "0px"}}>Account</ListTitle>
                                                <Small>Manage your account settings</Small>
                                            </ListItem>
                                            <ListItem className={"dash-menu-item"}>
                                                <ListTitle style={{marginBottom: "0px"}}>Email</ListTitle>
                                                <Small>Edit your notifications settings</Small>
                                            </ListItem>
                                            <ListItem className={"dash-menu-item"}>
                                                <ListTitle style={{marginBottom: "0px"}}>Authorized apps</ListTitle>
                                                <Small>Manage which applications can access your personal data</Small>
                                            </ListItem>
                                        </List>

                                        {/*Admin panel*/}
                                        {this.renderAdminPanel()}
                                    </div>
                                </div>
                                {/*Content*/}
                                <div className="dash-content siimple-grid-col siimple-grid-col--9">
                                    <Router.Switch>
                                        {/*Profile route*/}
                                        <Router.Route exact path={"/dashboard/"}
                                                      component={Profile}
                                                      props={{token: this.props.token}}/>
                                        {/*Account route*/}
                                        <Router.Route exact path={"/dashboard/account"}
                                                      component={Account}
                                                      props={{token: this.props.token}}/>
                                        {/*Applications route*/}
                                        <Router.Route exact path={"/dashboard/applications"}
                                                      component={Applications}
                                                      props={{token: this.props.token, admin: this.state.user.admin}}/>
                                        {/*New application route*/}
                                        <Router.Route exact path={"/dashboard/applications/create"}
                                                      component={CreateApp}
                                                      props={{token: this.props.token, admin: this.state.user.admin}}/>
                                        {/*Edit application route*/}
                                        <Router.Route exact path={"/dashboard/applications/:id"}
                                                      component={EditApp}
                                                      props={{token: this.props.token, admin: this.state.user.admin}}/>
                                        {/*Users route*/}
                                        <Router.Route exact path={"/dashboard/users"}
                                                      component={Users}
                                                      props={{token: this.props.token, user: this.state.user}}/>
                                    </Router.Switch>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>);
    }
}

export default Dashboard;
