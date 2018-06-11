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
        let index = this.state.modalIndex;
        let id = this.state.authorizations[index].app_id;
        return self.setState({"modalLoading": true}, function () {
            let requestOptions = {
                "url": "/api/user/authorizations/" + id,
                "method": "delete",
                "json": true
            };
            //Delete this authorization
            return request(requestOptions, function (error, response, body) {
                if (error) {
                    notification.error(error.message);
                    return self.setState({"modalLoading": false});
                }
                if (response.statusCode >= 300) {
                    notification.error(body.message);
                    return self.setState({"modalLoading": false});
                }
                //Authorization removed
                notification.success("Authorization removed");
                //Remove from the list of authorizations
                let authorizations = self.state.authorizations;
                authorizations.splice(index, 1);
                let newState = {
                    "authorizations": authorizations, 
                    "modalLoading": false, 
                    "modalVisible": false
                };
                return self.setState(newState);
            });
        });
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
            //Authorizations list
            let list = this.state.authorizations;
            return (
                <div>
                    <Header text="Authorizations"/>
                    {this.renderModal()}
                    <Paragraph>
                        You have granted access to <strong>{list.length} applications</strong> to your account.
                    </Paragraph>
                    <TableAuthorizations data={list} onClick={this.handleRevoke}/>
                </div>
            );
        }
    }
}

