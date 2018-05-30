import React from "react";
import {Btn} from "neutrine";

import "./styles.scss";

//Export header component
export default class Header extends React.Component {
    render() {
        let props = this.props;
        //Initialize the header components
        let textComponent = React.createElement("div", {"className": "header-text"}, props.text);
        let btnComponent = null;
        //Check if the button listener is provided
        if (typeof props.onBtnClick === "function") {
            let btnProps = {
                "className": "header-btn",
                "onClick": props.onBtnClick,
                "color": props.btnColor
            };
            btnComponent = React.CreateElement(Btn, btnProps, props.btnText);
        }
        //Return the header component
        return React.createElement("div", {"className": "header"}, textComponent, btnComponent);
    }
}

//Header default props 
Header.defaultProps = {
    "text": "",
    "btnText": "",
    "btnColor": "success",
    "onBtnClick": null
};

