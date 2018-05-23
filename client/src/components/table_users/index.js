import React from "react";
import {Btn, Checkbox, Tag} from "neutrine";

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

    renderItemActive(item, index){
        let tagProps = {"className": "table-active-tag"};
        let tagText;
        if(item.is_active){
            tagProps.color = "green";
            tagText = "Active";
        } else {
            tagProps.color = "light";
            tagText = "Inactive";
        }
        let tag = h(Tag, tagProps, tagText);
        return h("div", {className: "table-cell"}, tag);
    }

    renderEditBtn(item, index){
        let self = this;
        let btnProps = {
            "onClick": ()=> self.props.editUser(item, index, "edit"),
            "className": "table-btn table-btn--edit"
        };
        let button = h("div", btnProps);
        return h("div", {className: "table-cell"}, button);
    }

    renderDeleteBtn(item, index){
        let self = this;
        let btnProps = {
            "onClick": ()=> self.props.editUser(item, index, "delete"),
            "className": "table-btn table-btn--delete"
        };
        let button = h("div", btnProps);
        return h("div", {className: "table-cell"}, button);
    }

    render() {
        let self = this;
        //Display all the items of the table
        let children = this.props.data.map(function (item, index) {
            let itemContent = self.renderItemContent(item, index);
            let itemLogo = self.renderItemLogo(item, index);
            let itemActive = self.renderItemActive(item, index);
            let itemEditBtn = self.renderEditBtn(item, index);
            let itemDeleteBtn = self.renderDeleteBtn(item, index);
            let itemProps = {
                "className": "table-item",
                "key": index
            };
            //Return the item element
            return h("div", itemProps, itemLogo, itemContent, itemActive, itemEditBtn, itemDeleteBtn);
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

