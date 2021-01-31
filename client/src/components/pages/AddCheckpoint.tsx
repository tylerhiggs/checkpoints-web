import React, { Component } from "react";
import { RouteComponentProps, LocationProvider } from "@reach/router";
import "./AddCheckpoint.css";
import { socket } from "../../client-socket";

import { get, post } from "../../utilities";



type Props = {
    userId: String;
}

type Locations = {
    name: string, 
    lat: Number, 
    lon: Number
}[];

type State = {
    checkpoints: Locations;
    nameValue: string;
    addressValue: string;
    gotCheckpoints: boolean;
}

class AddCheckpoint extends Component<Props & RouteComponentProps, State> {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            checkpoints: [],
            nameValue: "",
            addressValue: "",
            gotCheckpoints: false,
        };
    }

    componentDidMount() {

        this._isMounted = true;
        this.setState({
            gotCheckpoints: false,
        });

        // geocoder stuff


        if (this.props.userId) {
            get("/api/checkpoints", {id:this.props.userId}).then((points: Locations) => {
                this.setState({checkpoints: points, gotCheckpoints: true});
            });
        }
        socket.on("checkpoints", (c: Locations) => {
            if (this._isMounted) {
                this.setState({
                    checkpoints: c,
                });
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleNameChange = (event) => {
        this.setState({
            nameValue: event.target.value,
        });
    }
    handleAddressChange = (event) => {
        this.setState({
            addressValue: event.target.value,
        });    
    }
    handleSubmit = (event) => {
        event.preventDefault();

        get("https://api.geocod.io/v1.6/geocode", {api_key: "16a67431190b5404030104976e9e101e5435947", q: this.state.addressValue, limit: 1}).then((res) => {
            let lat = Number(res.results[0].location.lat);
            let lon = Number(res.results[0].location.lng);
            // remember to catch errors on this
            post("/api/addCheckpoint", {id:this.props.userId, lat: lat, lon: lon, name: this.state.nameValue});

            this.setState({
                checkpoints: this.state.checkpoints.concat([{name: this.state.nameValue, lat: lat, lon: lon}]),
                nameValue: "",
                addressValue: "",
            });
        });
    }

    render() {

        if ( ! this.state.gotCheckpoints) {
            if (this.props.userId) {
                get("/api/checkpoints", {id:this.props.userId}).then((points: Locations) => {
                    this.setState({checkpoints: points, gotCheckpoints: true});
                });
            }
        }

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
                    placeholder="Address"
                    value={this.state.addressValue}
                    onChange={this.handleAddressChange}
                    className="field address-field"
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