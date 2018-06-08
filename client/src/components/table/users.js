import React from "react";
import {Tag} from "neutrine";
import Table from "./index.js";

let h = React.createElement;

//Export table user component
export default class TableUsers extends Table {
    constructor(props) {
        super(props);
    }

    //Get the image
    getImage(item, index) {
        return h("div", {"className": "pf-table-image pf-table-image--user"}, null);
    }

    //Get the table title content
    getTitle(item, index) {
        return item.name;
    }

    //Get the table subtitle content
    getDescription(item, index) {
        return item.email;
    }

    //Get extra columns
    getExtraColumns(item, index) {
        return [
            this.renderActiveColumn(item, index),
            this.renderRoleColumn(item, index),
            this.renderEditColumn(item, index),
            this.renderDeleteColumn(item, index)
        ];
    }

    //Generate the active column
    renderActiveColumn(item, index){
        let tag = null;
        if(item.is_active){
            tag = h(Tag, {"color": "success"}, "Active");
        } else {
            tag = h(Tag, {"color": "light"}, "Inactive");
        }
        //Return the tag column
        return h("div", {"className": "pf-table-cell pf-table-cell--tag", "key": 2}, tag);
    }

    //Generate the role column
    renderRoleColumn(item, index){
        let tag = null;
        if (item.is_owner === true) {
            tag = h(Tag, {"color": "error"}, "Owner");
        }
        else if (item.is_admin === true){
            tag = h(Tag, {"color": "primary"}, "Admin");
        } else {
            tag = h(Tag, {"color": "light"}, "User");
        }
        //Return the tag column
        return h("div", {"className": "pf-table-cell pf-table-cell--tag", "key": 3}, tag);
    }

    //Render the icon
    renderIcon(item, index, type, listener) {
        let iconProps = {
            "className": ["pf-table-icon", "pf-table-icon--" + type]
        };
        //Not able to edit himself || edit other admins (unless he's the owner)
        if (this.props.user.id === item.id || (item.is_admin && this.props.user.isOwner === false)) {
            iconProps.className.push("pf-table-icon--disabled");
        }
        else {
            //Add the click listener
            iconProps.onClick = function () {
                return listener.call(null, item, index);
            };
        }
        //Join all class names
        iconProps.className = iconProps.className.join(" ");
        //Return the icon element
        return h("div", iconProps, null);
    }

    //Generate the edit icon column
    renderEditColumn(item, index){
        let self = this;
        let icon = self.renderIcon(item, index, "edit", self.props.onEditClick);
        //Return the column with the edit icon
        return h("div", {"className": "pf-table-cell", "key": 4}, icon);
    }

    //Render the delete icon column
    renderDeleteColumn(item, index){
        let self = this;
        let icon = self.renderIcon(item, index, "delete", self.props.onDeleteClick);
        //Return the column with the delete icon
        return h("div", {"className": "pf-table-cell", "key": 5}, icon);
    }
}

//Users table default props
TableUsers.defaultProps = {
    "data": [],
    "user": null,
    "onEditClick": null,
    "onDeleteClick": null
};

