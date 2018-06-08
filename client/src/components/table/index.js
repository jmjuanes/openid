import React from "react";
import {Btn} from "neutrine";

import "./style.scss";

//Create element alias
let h = React.createElement;

//Table component 
export default class Table extends React.Component {
    constructor(props) {
        super(props);
    }

    //Render the row image
    renderItemImage(item, index) {
        return h("div", {"className": "pf-table-cell", "key": 0}, this.getImage.call(this, item, index));
    }

    renderItemContent(item, index) {
        //Get the item title and description
        let title = h("div", {"className": "pf-table-title"}, this.getTitle.call(this, item, index));
        let description = h("div", {"className": "pf-table-description"}, this.getDescription.call(this, item, index));
        //Return the item content
        return h("div", {"className": "pf-table-cell pf-table-cell--primary", "key": 1}, title, description);
    }

    //Render the extra columns
    renderExtraColumns(item, index) {
        return this.getExtraColumns.call(this, item, index);
    }

    render() {
        let self = this;
        //Display all the items of the table
        let children = this.props.data.map(function (item, index) {
            //Initialize the columns list
            let columns = [];
            columns.push(self.renderItemImage(item, index));
            columns.push(self.renderItemContent(item, index));
            //Get the extra columns
            let extraCols = self.renderExtraColumns(item, index);
            //Return the item element
            return h("div", {"className": "pf-table-item", "key": index}, columns.concat(extraCols));
        });
        //Return the applications table
        return h("div", {"className": "pf-table"}, children);
    }
}

