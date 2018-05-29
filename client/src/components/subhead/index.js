import React from "react";
import {Btn} from "neutrine";

import "./styles.scss";

//Create element alias
let h = React.createElement;

//Export subhead component
export default class Subhead extends React.Component {
    renderHeader() {
        //Generate the subhead heading block
        return h("div", {className: "subhead-heading"}, this.props.headerText);
    }

    renderBtn() {
        let props = this.props;
        //Check for button 
        if (typeof props.onBtnClick === "function") {
            return h(Btn, {className: "subhead-btn", color: props.btnColor, onClick: props.onBtnClick}, props.btnText);
        }
        return null;
    }

    render() {
        //Generate the subhead component
        return h("div", {className: "subhead"}, this.renderHeader(), this.renderBtn());
    }
}

//Subhead default props 
Subhead.defaultProps = {
    "headerText": "",
    "btnText": "",
    "btnColor": "success",
    "onBtnClick": null
};

