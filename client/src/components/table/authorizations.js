import React from "react";
import {Btn} from "neutrine";
import Table from "./index.js";

let h = React.createElement;

//Export authorizations table
export default class TableAuthorizations extends Table {
    constructor(props) {
        super(props);
    }

    //Get the image
    getImage(item, index) {
        return h("div", {"className": "pf-table-image pf-table-image--application"}, null);
    }

    //Get the table title content
    getTitle(item, index) {
        return item.application.name;
    }

    //Get the table subtitle content
    getDescription(item, index) {
        let currentDate = new Date(item.last_access);
        return "Last used on " + currentDate.toString() + "";
    }

    //Get the extra columns
    getExtraColumns(item, index) {
        let self = this;
        //Click listener
        let listener = function () {
            if (typeof self.props.onClick === "function") {
                return self.props.onClick.call(null, item, index);
            }
        };
        //Generate the button element
        let button = h(Btn, {"color": "red", "className": "pf-table-btn", "onClick": listener}, "Revoke");
        //Return the extra columns list
        return [h("div", {"className": "pf-table-cell", "key": 2}, button)];
    }
}

//Authorizations table default props
TableAuthorizations.defaultProps = {
    "data": [],
    "onClick": null
};

