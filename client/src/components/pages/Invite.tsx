import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import "./Invite.css";

import { get, post } from "../../utilities";

type Props = {
    userId: String;
}
type State = {
    value: any;
}


class Invite extends Component<Props & RouteComponentProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
        }
    }

    // called whenever the user types in the new post input box
    handleChange = (event) => {
    this.setState({
        value: event.target.value,
    });
    };

    handleInvite = (event) => {
        post("/api/invite", { id: this.props.userId, email: this.state.value});
        // lastly
        this.setState({
            value: "",
        });
    }


    render() {
        return (
            <div className="u-flex-justifyCenter">
                <div className="long-box">
                    <h2 className="input-question">Who would you like to invite?</h2>
                    <input 
                        type="text"
                        placeholder="email"
                        value={this.state.value}
                        onChange={this.handleChange}
                        className="NewPostInput-input"
                    />
                    <button
                        type="submit"
                        className="invite-button"
                        value="Invite!"
                        onClick={this.handleInvite}
                    >
                        Invite!
                    </button>
                </div>
            </div>
        );
    }
}

export default Invite;