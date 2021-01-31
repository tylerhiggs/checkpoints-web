import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import "./Feed.css";
import { socket } from "../../client-socket";

import { get } from "../../utilities";

type Props = {
    userId: String;
}

type State = {
    gotFeed: boolean;
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

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            gotFeed: false,
            feed: [],
        };
    }

    componentDidMount() {
        this._isMounted = true;
        this.setState({ gotFeed: false});
            
        console.log("home, but socket shoudl be next");
        this.updateFeed();
        socket.on("feed", (feed: PeoplePlace[]) => {
            if (this._isMounted) {
                this.setState({
                    feed: feed,
                });
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateFeed() {
        if (this.props.userId) {
            get("/api/feed", {id: this.props.userId}).then((feed: PeoplePlaces) => {
                this.setState({
                    feed: feed,
                    gotFeed: true,
                });
            });
        }
    }

    

    render() {
        if (! this.state.gotFeed) {
            this.updateFeed();
        }
        let html;
        if (this.state.feed !== null && this.state.feed.length !== 0) {
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

