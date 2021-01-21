import React, { Component } from "react";
import { RouteComponentProps, LocationProvider } from "@reach/router";
import "./AddCheckpoint.css";

import { get, post } from "../../utilities";

type Props = {
    userId: String;
}

type Location = {
    name: String, 
    lat: Number, 
    lon: Number
}[];

type State = {
    checkpoints: Location;
    nameValue: string;
    latValue: string;
    lonValue: string;
}

class AddCheckpoint extends Component<Props & RouteComponentProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            checkpoints: [],
            nameValue: "",
            latValue: "",
            lonValue: "",
        };
    }

    componentDidMount() {
        if (this.props.userId) {
            get("/api/checkpoints", {id:this.props.userId}).then((points: Location) => {
                this.setState({checkpoints: points});
            });
        }

    }

    handleNameChange = (event) => {
        this.setState({
            nameValue: event.target.value,
        });
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
        post("/api/addCheckpoint", {id:this.props.userId, lat: this.state.latValue, lon: this.state.lonValue, name: this.state.nameValue});
    }

    render() {
        let inputBox = (
            <div className="long-box">
                <input
                    type="text"
                    placeholder="Name"
                    value={this.state.nameValue}
                    onChange={this.handleNameChange}
                    className="field"
                />
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
                    value="Add Checkpoint"
                    onClick={this.handleSubmit}
                > Add Checkpoint</button>
            </div>
        );
        let checkpointBox;
        if (this.state.checkpoints.length !== 0) {
            checkpointBox = this.state.checkpoints.map((element) => (
                <div className="long-box">
                    <div className="u-padding">Name: {element.name}</div>
                    <div className="u-padding">Latitude: {element.lat}</div>
                    <div className="u-padding">Longitude: {element.lon}</div>
                </div>
            ));
        } else {
            checkpointBox = (
                <div className="u-padding">
                    Add some checkpoints :)
                </div>
            )
        }

        return (
            <div className="u-flex u-flex-alignCenter u-flexColumn">
                {inputBox}
                {checkpointBox}
            </div>
        );
    }
}

export default AddCheckpoint;