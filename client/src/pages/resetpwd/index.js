import React from "react";
import {Heading, Small} from "neutrine";
import * as Router from "rouct";

import * as notification from "../../commons/notification.js";

import ResetPwdSend from "./send.js";
import ResetPwdReset from "./reset.js";

import "./styles.scss";

//Export resetpwd component
export default class ResetPwd extends React.Component {
    render() {
        let props = {
            "captcha_enabled": this.props.captcha_enabled,
            "captcha_key": this.props.captcha_key
        };
        return (
            <div className="pf-resetpwd-content">
                <Heading type="h2" align="center">Reset password</Heading>
                <Router.Switch>
                    <Router.Route exact path="/resetpwd" component={ResetPwdSend} props={props}/>
                    <Router.Route exact path="/resetpwd/:id" component={ResetPwdReset} props={props}/>
                </Router.Switch>
            </div>
        );
    }
}

