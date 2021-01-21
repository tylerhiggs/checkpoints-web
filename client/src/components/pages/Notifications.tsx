import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import Notification from "../modules/Notification"
import { get, post } from "../../utilities";
import User from "../../../../shared/User";


type Props = {
    userId: String;
}

type State = {
    notifications: String[];
    users: User[];
    show: String;
}

class Notifications extends Component<Props & RouteComponentProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            users: [],
            show: "No notifications to show",
        };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        if (this.props.userId) {
            get("/api/notifications", {id: this.props.userId}).then((fetchedNotifications) => {
                this.setState({notifications: fetchedNotifications});
                this.getUsers();
            }, (error) => {
                console.log(error);
            });
        }
    }


    getUsers() {
        if (this.props.userId) {
            for (let i = 0; i < this.state.notifications.length;i++) {
                get("/api/user", {id: this.state.notifications[i]}).then((user) => {
                    this.setState({users: this.state.users.concat([user])});
                    this.setState({show: "something more"});
                }, (error) => {
                    console.log(error);
                    this.setState({show: error});
                });
            }
        }
    }

    render() {
        var available = this.state.users.length !== 0;
        var notificationhtml = this.state.users.map((element) => (
            <Notification 
                userId={this.props.userId} 
                title={`${element.name} invited you to join their family`} 
                senderUserId={element._id} 
                reload={this.reload}
            />
        ));

        const nothing = (
            <h1>
                {this.state.show}
            </h1>
        );

        const html = (
            <div className="u-flex u-flex-alignCenter u-flexColumn">
                {notificationhtml}
            </div>
        )

        return (available) ? html : nothing;
    }
}

export default Notifications;