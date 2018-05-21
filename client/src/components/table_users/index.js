import React from "react";
import {Btn, Checkbox} from "neutrine";

import "./style.scss";

//Create element alias
let h = React.createElement;

//Table component 
export default class TableUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: {}
        };

        this.handleActiveClick = this.handleActiveClick.bind(this);
    }

    handleActiveClick(e) {
        let index = String(e.nativeEvent.target.dataset.index);
        // Check whether if the checkbox is checked or not
        let isChecked = typeof this.state.checked[index] !== "undefined" && this.state.checked[index] !== false;
        // Create an object with the changes in the checkbox (dynamic key)
        let obj = Object.assign(this.state.checked, {[index]: !isChecked});
        this.setState({
            checked: obj
        });
    }

    renderItemLogo(item, index) {
        let logo = h("div", {className: "table-logo table-logo--" + this.props.icon}, null);
        return h("div", {className: "table-cell"}, logo);
    }

    renderItemContent(item, index) {
        let title = h("div", {className: "table-title"}, this.props.customTitle.call(null, item));
        let detail = h("div", {className: "table-detail"}, this.props.customDetail.call(null, item));
        //Return the item content
        return h("div", {className: "table-cell table-cell--primary"}, title, detail);
    }

    renderItemAction(item, index) {
        let checkboxProps = {
            onChange: this.handleActiveClick,
            defaultChecked: false,
            "data-index": index.toString()
        };
        let checkbox = h(Checkbox, checkboxProps);
        return h("div", {className: "table-cell"}, checkbox);
    }

    render() {
        let self = this;
        //Display all the items of the table
        let children = this.props.data.map(function (item, index) {
            let itemContent = self.renderItemContent(item, index);
            let itemLogo = self.renderItemLogo(item, index);
            let itemAction = self.renderItemAction(item, index);
            let itemProps = {
                "className": "table-item",
                "key": index
            };
            //Return the item element
            return h("div", itemProps, itemLogo, itemContent, itemAction);
        });
        //Return the applications table
        return h("div", {className: "table"}, children);
    }
}

//Table default props
TableUsers.defaultProps = {
    data: [],
    icon: "applications",
    customTitle: null,
    customDetail: null,
    onClick: null,
    onActionClick: null,
    actionText: "Manage",
    actionColor: "primary"
};

