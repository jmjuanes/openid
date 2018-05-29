import React from "react";
import {Btn} from "neutrine";

import "./styles.scss";

//Export subhead component
export default class Subhead extends React.Component {
    renderBtn() {
        if (typeof this.props.onBtnClick === "function") {
            return (
                <Btn className="subhead-btn" color={this.props.btnColor} onClick={this.props.onBtnClick}>
                    {this.props.btnText}
                </Btn>
            );
        }
    }

    render() {
        return (
            <div className="subhead">
                <div className="subhead-heading">{this.props.headerText}</div>
                {this.renderBtn()}
            </div>
        );
    }
}

//Subhead default props 
Subhead.defaultProps = {
    "headerText": "",
    "btnText": "",
    "btnColor": "success",
    "onBtnClick": null
};

