import React from "react";
import {Btn} from "neutrine";
import Table from "./index.js";

let h = React.createElement;

//Export applications table
export default class TableApplications extends Table {
    constructor(props) {
        super(props);
    }

    //Get the image
    getImage(item, index) {
        return h("div", {"className": "pf-table-image pf-table-image--application"}, null);
    }

    //Get the table title content
    getTitle(item, index) {
        return item.name;
    }

    //Get the table subtitle content
    getDescription(item, index) {
        return item.description;
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
        let button = h(Btn, {"color": "primary", "className": "pf-table-btn", "onClick": listener}, "Manage");
        //Return the extra columns list
        return [h("div", {"className": "pf-table-cell", "key": 2}, button)];
    }
}

//Applications table default props
TableApplications.defaultProps = {
    "data": [],
    "onClick": null
};

