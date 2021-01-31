import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import "./Notification.css";

import { post } from "../../utilities";

type Props = {
    userId: String;
    title: String;
    senderUserId: String;
    reload: () => void;
    deleteNote: (string) => void;
}

type State = {
    accepted: boolean,
    rejected: boolean,
}



class Notification extends Component<Props & RouteComponentProps, State> {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            accepted: false,
            rejected: false,
        };

    }

    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    accept = (event) => {
        post("/api/accept", {senderUserId: this.props.senderUserId, acceptorUserId: this.props.userId}).then((res) => {
            this.props.reload();
            console.log("ACCEPTING");
        });
        if (this._isMounted) {
            this.setState({
                accepted: true,
            });
        }
    }

    reject = (event) => {
        post("/api/reject", {senderUserId: this.props.senderUserId, acceptorUserId: this.props.userId}).then((res) => {
            console.log("rejecting");
        });
        if (this._isMounted) {
            this.setState({
                rejected: true
            });
        }
    }

    render() {
        let ret;
        if (this.state.accepted) {
            console.log("ACCEPTED ACCEPTED");
            ret = (
                <div className="accepted-box">
                    <h2 className="Notification-text">
                        Accepted
                    </h2>
                </div>
            );
        } else if (this.state.rejected) {
            ret = (
                <div className="rejected-box">
                    <h2 className="Notification-text">
                        Rejected
                    </h2>
                </div>
            );
        } else {

            ret = (
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

        return ret;
    }
}

export default Notification;