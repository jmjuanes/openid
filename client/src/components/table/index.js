import React from "react";
import {Btn} from "neutrine";

import "./style.scss";

//Create element alias
let h = React.createElement;

//Table component 
export default class Table extends React.Component {
    constructor(props) {
        super(props);
        this.handleActiveClick = this.handleActiveClick.bind(this);
    }

    handleActiveClick(e) {
        let index = parseInt(e.nativeEvent.target.dataset.index);
        if (typeof this.props.onActionClick === "function") {
            this.props.onActionClick.call(null, this.props.data[index], index);
        }
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
        let self = this;
        let btnProps = {
            "color": this.props.actionColor,
            "style": {
                "height": "30px",
                "lineHeight": "30px",
                "fontSize": "14px"
            },
            "data-index": index.toString(),
            "onClick": self.handleActiveClick
        };
        let button = h(Btn, btnProps, this.props.actionText);
        return h("div", {className: "table-cell"}, button);
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
Table.defaultProps = {
    data: [],
    icon: "applications",
    customTitle: null,
    customDetail: null,
    onClick: null,
    onActionClick: null,
    actionText: "Manage",
    actionColor: "primary"
};

