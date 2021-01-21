import React, { Component } from "react";
import { Link } from "@reach/router";
import GoogleLogin, {  GoogleLoginResponse, GoogleLoginResponseOffline, GoogleLogout} from 'react-google-login';
import { ProgressPlugin } from "webpack";

import "./NavBar.css";

const GOOGLE_CLIENT_ID = "542548052137-v350l0as3eh874cl00mcqu08n1a0b8po.apps.googleusercontent.com";


type Props = {
    userId: String;
    handleLogin: (res: GoogleLoginResponse | GoogleLoginResponseOffline) => void;
    handleLogout: () => void;
  }
  type State = {
    loggedIn: boolean;
  }

/**
 * The navigation bar at the top of all pages. Takes no props
 */
class NavBar extends Component<Props, State> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <nav className="NavBar-container u-flex u-flex-spaceBetween u-flex-alignCenter">
                <div className="NavBar-title">Checkpoints 180</div>
                <div className="NavBar-linkContainer u-flex u-flex-rowReverse u-flex-spaceAround u-flex-alignCenter">
                    {this.props.userId ? (
                        <GoogleLogout
                            clientId={GOOGLE_CLIENT_ID}
                            buttonText="Logout"
                            onLogoutSuccess={this.props.handleLogout}
                            onFailure={() => console.log("ERROR LOGGING OUT")}
                            className="NavBar-link NavBar-login"
                        />
                    ) : (
                        <GoogleLogin
                            clientId={GOOGLE_CLIENT_ID}
                            buttonText="Login"
                            onSuccess={this.props.handleLogin}
                            onFailure={() => console.log("ERROR LOGGING IN!!")}
                            className="NavBar-link NavBar-login"
                        />
                    )}
                    <Link to="/update-location" className="NavBar-link">
                        Update Location
                    </Link>
                    <Link to="/notifications" className="NavBar-link">
                        Notifications
                    </Link>
                    <Link to="/invite" className="NavBar-link">
                        Invite to family
                    </Link>
                    <Link to="/add-checkpoint" className="NavBar-link">
                        Add Checkpoint
                    </Link>
                    <Link to="/" className="NavBar-link">
                        Home
                    </Link>

                </div>
            </nav>
        );
    }
}

export default NavBar;

