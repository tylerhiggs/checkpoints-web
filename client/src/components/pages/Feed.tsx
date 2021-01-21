import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import "./Feed.css";

import { get } from "../../utilities";

type Props = {
    userId: String;
}

type State = {
    feed: PeoplePlaces;
}

type PeoplePlaces = {
    name: string, 
    location: string,
}[]
type PeoplePlace = {
    name: string, 
    location: string,
}

class Feed extends Component<Props & RouteComponentProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            feed: [],
        };
    }

    componentDidMount() {
        if (this.props.userId) {
            get("/api/feed", {id: this.props.userId}).then((feed: PeoplePlaces) => {
                this.setState({
                    feed: feed,
                });
                this.render();
            });
        }
    }

    render() {
        let html;
        if (this.props.userId) {
            html = (
                this.state.feed.map((info: PeoplePlace) => (
                    <div className="main-box">
                        <div className="u-padding user-text">{info.name}</div>
                        <div className="u-padding user-text">{info.location}</div>
                    </div>
                ))
            );
            html = (
                <div className="u-flex u-flexColumn u-flex-alignCenter">
                    {html}
                </div>
            );
        } else {
            html = (
                <div> Nothin' to see here </div>
            );
        }
        return html;
    }
}

export default Feed;

