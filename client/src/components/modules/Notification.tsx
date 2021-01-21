import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import "./Notification.css";

import { post } from "../../utilities";

type Props = {
    userId: String;
    title: String;
    senderUserId: String;
    reload: () => void;
}



class Notification extends Component<Props & RouteComponentProps> {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        this.setState({
            words: "not anything",
        });
    }

    accept = (event) => {
        post("/api/accept", {senderUserId: this.props.senderUserId, acceptorUserId: this.props.userId}).then((res) => {
            this.props.reload();
        });
    }

    reject = (event) => {
        post("/api/reject", {senderUserId: this.props.senderUserId, acceptorUserId: this.props.userId}).then((res) => {
            this.props.reload();
        });
    }

    render() {
        return (
            <div className="long-box">
                <h2 className="Notification-text">{this.props.title}</h2>
                <button
                    type="submit"
                    className="Notification-button Accept-button"
                    value="Accept"
                    onClick={this.accept}
                >
                    Accept
                </button>
                <button
                    type="submit"
                    className="Notification-button Reject-button"
                    value="Reject"
                    onClick={this.reject}
                >
                    Reject
                </button>
            </div>
        );
    }
}

export default Notification;