import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import Notification from "../modules/Notification"
import { get, post } from "../../utilities";
import User from "../../../../shared/User";
import { socket } from "../../client-socket";


type Props = {
    userId: String;
}

type State = {
    notifications: Note[];
    gotNotifications: boolean;
    show: String;
}

type Note = {
    senderId: string,
    senderName: string,
};

class Notifications extends Component<Props & RouteComponentProps, State> {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            gotNotifications: false,
            show: "No notifications to show",
        };
    }

    componentDidMount() {
        this._isMounted = true;
        
        this.reload();
        socket.on("notifications", (notes: Note[]) => {
            if (this._isMounted) {
                this.setState({
                    notifications: notes,
                });
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    reload() {
        if (this.props.userId) {
            get("/api/notifications", {id: this.props.userId}).then((fetchedNotifications) => {
                this.setState({notifications: fetchedNotifications, gotNotifications: true});
            }, (error) => {
                console.log(error);
            });
        }
    }

    deleteNotification(senderId: string) {
        console.log("deleting notification")
        let notes = [];
        for (let i = 0; i < this.state.notifications.length; i++) {
            if (this.state.notifications[i].senderId !== senderId) {
                notes.push(this.state.notifications[i]);
            }
        }
        this.setState({
            notifications: notes,
            gotNotifications: false
        });
    }

    render() {
        if ( ! this.state.gotNotifications) {
            this.reload();
        }
        var available = this.state.notifications.length !== 0;
        var notificationhtml = this.state.notifications.map((element: Note) => (
            <Notification 
                userId={this.props.userId} 
                title={`${element.senderName} invited you to join their family`} 
                senderUserId={element.senderId} 
                reload={this.reload}
                deleteNote={this.deleteNotification}
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