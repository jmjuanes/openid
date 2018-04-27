import React from "react";

import "./styles.scss";
import Profile from "./profile/index";

class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        // Bind functions
        this.renderAdminPanel = this.renderAdminPanel.bind(this);
    }

    renderAdminPanel() {
        if (this.props.is_admin === true) {
            return (
                // Admin panel
                <div className="dash-admin-panel">
                    <div className="siimple-menu">
                        <div className="siimple-menu-group">Administration</div>
                        <a className="siimple-menu-item" href="#">Users management</a>
                        <a className="siimple-menu-item" href="#">Apps management</a>
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="siimple-content siimple-content--small">
                <div className="siimple-grid">
                    <div className="siimple-grid-row">
                        {/*Side menu*/}
                        <div className="dash-menu siimple-grid-col siimple-grid-col--3">
                            {/*User panel*/}
                            <div className="dash-user-panel">
                                <div className="siimple-menu">
                                    <div className="siimple-menu-group">Personal settings</div>
                                    <a className="siimple-menu-item" href="#">Profile</a>
                                    <a className="siimple-menu-item">Authorised apps</a>
                                    <a className="siimple-menu-item" href="#">Change password</a>
                                    <a className="siimple-menu-item" href="#">Delete account</a>
                                </div>
                            </div>
                            {/*Admin panel*/}
                            {this.renderAdminPanel()}
                        </div>
                        {/*Content*/}
                        <div className="dash-content siimple-grid-col siimple-grid-col--9">
                            <Profile token={this.props.token}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default Dashboard;