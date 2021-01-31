import React, { Component } from "react";
import { RouteComponentProps } from "@reach/router";
import "./AddCheckpoint.css"
import User from '../../../../shared/User';

import { post } from "../../utilities";

type Props = {
    userId: String;
}

type State = {
    latValue: string;
    lonValue: string;
}

class UpdateLocation extends Component<Props & RouteComponentProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            latValue: "",
            lonValue: "",
        };
    }



    handleLatChange = (event) => {
        this.setState({
            latValue: event.target.value,
        });    
    }
    handleLonChange = (event) => {
        this.setState({
            lonValue: event.target.value,
        });    
    }
    handleSubmit = (event) => {
        event.preventDefault();
        post("/api/updateLocation", {id:this.props.userId, lat: this.state.latValue, lon: this.state.lonValue});
        this.setState({
            latValue: "",
            lonValue: "",
        })
    }



    render() {
        let inputBox = (
            <div className="long-box">
                <input
                    type="text"
                    placeholder="Lat"
                    value={this.state.latValue}
                    onChange={this.handleLatChange}
                    className="field"
                />
                <input
                    type="text"
                    placeholder="Lon"
                    value={this.state.lonValue}
                    onChange={this.handleLonChange}
                    className="field"
                />
                <button 
                    type="submit"
                    className="add-button"
                    value="Update Location"
                    onClick={this.handleSubmit}
                > Update Location</button>
            </div>
        );
        return (
            <div className="u-flex u-flex-alignCenter u-flexColumn">
                {inputBox}
            </div>
        );
    }
}

export default UpdateLocation;