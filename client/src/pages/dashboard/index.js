import React from "react";
import * as Router from "rouct";
import {Btn, List, ListItem, ListTitle, Spinner, Small, Content} from "neutrine";
import {Navbar, NavbarTitle, NavbarSubtitle, NavbarItem} from "neutrine";
import {Grid, GridRow, GridCol} from "neutrine";
import {request} from "@kofijs/request";

import * as auth from "../../commons/auth.js";
import * as notification from "../../commons/notification.js";

import "./styles.scss";

import Account from "./account/index.js";
import Profile from "./profile/index.js";
import Applications from "./applications/index.js";
import Authorizations from "./authorizations/index.js";
import EditApp from "./applications/edit.js";
import CreateApp from "./applications/create.js";
import Users from "./users/index.js";
import NewUser from "./users/new.js";

//Main dashboard
export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "ready": false,
            "user": null
        };
        //Bind methods
        this.redirectTo = this.redirectTo.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.renderAdminPanel = this.renderAdminPanel.bind(this);
    }

    componentDidMount() {
        //If there's no access token, redirect to login
        if (auth.hasToken() === false) {
            return Router.redirectHashbang("/login");
        }
        let self = this;
        let requestOptions = {
            "url": "/api/user",
            "method": "get",
            "json": true,
            "auth": auth.generateAuth()
        };
        return request(requestOptions, function (error, response, body) {
            if (error) {
                return notification.error(error.message);
            }
            if (response.statusCode >= 300) {
                return notification.error(body.message);
            }
            //New user information
            let newUserData = {
                "name": body.name,
                "id": body.id,
                "isAdmin": body.is_admin,
                "isOwner": body.is_owner
            };
            return self.setState({"user": newUserData, "ready": true});
        });
    }

    //Left panel redirects
    redirectTo(path) {
        return Router.redirectHashbang("/dashboard/" + path);
    }

    //Logout
    handleLogout() {
        //Delete the token and redirect to the login page
        auth.deleteToken();
        return Router.redirectHashbang("/login");
    }

    //Show the admin routes if the user is admin
    renderAdminPanel() {
        if (this.state.user.isAdmin) {
            return (
                <List hover={true}>
                    <ListItem className="pf-dashboard-menu-item" onClick={() => { this.redirectTo("applications") }}>
                        <ListTitle>Applications</ListTitle>
                        <Small>Manage all the registered applications</Small>
                    </ListItem>
                    <ListItem className="pf-dashboard-menu-item" onClick={() => { this.redirectTo("users") }}>
                        <ListTitle>Users</ListTitle>
                        <Small>Manage all the registered users</Small>
                    </ListItem>
                </List>
            );
        }
    }

    render() {
        if (this.state.ready === false) {
            return <Spinner color="primary" className="dash-loading"/>;
        }
        else {
            //User information
            let userProps = this.state.user;
            return (
                <div>
                    <Navbar size="medium" color="light">
                        <NavbarTitle>OpenID</NavbarTitle>
                        <NavbarSubtitle>Dashboard</NavbarSubtitle>
                        <NavbarItem className="pf-dashboard-logout" onClick={this.handleLogout}>Log out</NavbarItem>
                    </Navbar>
                    <Content size="medium">
                        <GridRow>
                            <GridCol className="pf-dashboard-menu" size={3} small={12}>
                                {/*User panel*/}
                                <List hover={true}>
                                    <ListItem className="pf-dashboard-menu-item" onClick={() => { this.redirectTo("") }}>
                                        <ListTitle>Profile</ListTitle>
                                        <Small>Edit your personal info</Small>
                                    </ListItem>
                                    <ListItem className="pf-dashboard-menu-item" onClick={() => { this.redirectTo("account") }}>
                                        <ListTitle>Account</ListTitle>
                                        <Small>Manage your account settings</Small>
                                    </ListItem>
                                    <ListItem className="pf-dashboard-menu-item">
                                        <ListTitle>Email</ListTitle>
                                        <Small>Edit your notifications settings</Small>
                                    </ListItem>
                                    <ListItem className="pf-dashboard-menu-item" onClick={() => { this.redirectTo("authorizarions") }}>
                                        <ListTitle>Authorized apps</ListTitle>
                                        <Small>Manage which applications can access your personal data</Small>
                                    </ListItem>
                                </List>
                                {/*Admin panel*/}
                                {this.renderAdminPanel()}
                            </GridCol>
                            {/*Content*/}
                            <GridCol className="pf-dashboard-content" size={9} small={12}>
                                <Router.Switch>
                                    <Router.Route exact path="/dashboard/" component={Profile} props={userProps}/>
                                    <Router.Route exact path="/dashboard/account" component={Account} props={userProps}/>
                                    <Router.Route exact path="/dashboard/authorizations" component={Authorizations} props={userProps}/>
                                    <Router.Route exact path="/dashboard/applications" component={Applications} props={userProps}/>
                                    <Router.Route exact path="/dashboard/applications/create" component={CreateApp} props={userProps}/>
                                    <Router.Route exact path="/dashboard/applications/:id" component={EditApp} props={userProps}/>
                                    <Router.Route exact path="/dashboard/users" component={Users} props={userProps}/>
                                    <Router.Route exact path="/dashboard/users/new" component={NewUser} props={userProps}/>
                                </Router.Switch>
                            </GridCol>
                        </GridRow>
                    </Content>
                </div>
            );
        }
    }
}

