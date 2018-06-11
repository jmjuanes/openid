import React from "react";
import {request} from "@kofijs/request";
import {Btn, Heading, Paragraph, Spinner} from "neutrine";

import Header from "../../../components/header/index.js";
import TableAuthorizations from "../../../components/table/authorizations.js";

import * as notification from "../../../commons/notification.js";
import * as auth from "../../../commons/auth.js";

//Export authorizations page
export default class Authorizations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "authorizations": null,
            "modalVisible": false,
            "modalLoading": false, 
            "modalItem": -1
        };
        //Bind methods
        this.handleRevoke = this.handleRevoke.bind(this);
        this.handleRevokeSend = this.handleRevokeSend.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    //Import the authorizations for this user
    componentDidMount() {
        let self = this;
        let requestOptions = {
            "url": "/api/user/authorizations",
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
            //console.log(body.authorizations);
            //Save the authorizations list
            return self.setState({"authorizations": body.authorizations});
        });
    }

    //Hide modal
    hideModal() {
        //Check if modal is not loading 
        if (this.state.modalLoading === false) {
            return this.setState({"modalVisible": false, "modalLoading": false});
        }
    }

    //Handle revoke
    handleRevoke(item, index) {
        //Update the state
        return this.setState({"modalLoading": false, "modalVisible": true, "modalIndex": index});
    }

    //Handle revoke confirm
    handleRevokeSend() {
        let self = this;
        let app = this.state.authorizations[this.state.modalIndex].app_id;
        console.log(app);
    }

    //Render the modal submit
    renderModalSubmit() {
        if (this.state.modalLoading === true) {
            return <Spinner color="error"/>;
        }
        else {
            return <Btn color="error" onClick={this.handleRevokeSend} fluid>I understand, revoke access</Btn>;
        }
    }

    //Render the modal
    renderModal() {
        //Check if modal is visible
        if (this.state.modalVisible === true) {
            let app = this.state.authorizations[this.state.modalIndex].application;
            return (
                <div className="pf-modal">
                    <div className="pf-modal-content">
                        <span className="pf-modal-hide" onClick={this.hideModal}>&times;</span>
                        <Heading type="h4" className="pf-modal-title">Revoke authorization</Heading>
                        <Paragraph>
                            This action can not be undone. <strong>{app.name}</strong> will no longer be able to access to your information. 
                        </Paragraph>
                        {this.renderModalSubmit()}
                    </div>
                </div> 
            ); 
        }
    }

    //Render the authorizations view
    render() {
        if (this.state.authorizations === null) {
            return <Spinner color="primary"/>;
        }
        else {
            return (
                <div>
                    <Header text="Authorizations"/>
                    {this.renderModal()}
                    <Paragraph>
                        You have granted access to <strong>{this.state.authorizations.length} applications</strong> to your account.
                    </Paragraph>
                    <TableAuthorizations data={this.state.authorizations} onClick={this.handleRevoke}/>
                </div>
            );
        }
    }
}

