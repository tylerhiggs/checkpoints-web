import express from "express";
import auth from "./auth";
import socketManager from "./server-socket";
import UserModel, { User } from "./models/User";
import FamilyModel, { Family } from "./models/Family";
import Notification from "./models/Notification";
const router = express.Router();

const THREASHOLD = 1; // must be within a THREASHOLD mile radius of the given lat,lon

router.post("/login", auth.login);
router.post("/login-mobile", auth.loginMobile);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // Not logged in.
    return res.send({});
  }
  console.log("HERE HERE HERE HERE");
  console.log(res);
  res.send(req.user);
});
router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) {
    const socket = socketManager.getSocketFromSocketID(req.body.socketid);
    if (socket !== undefined) socketManager.addUser(req.user, socket);
  }
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------| 

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
}

const getDistanceFromLatLonInMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3963; // Radius of the earth in miles
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

/**
 * 
 * @param familyId what do you want to call the family
 * @param user user to start family
 * 
 * PLEASE CALL family.save() AFTER CALLING createFamily()!!!!
 */
const createFamily = (familyId: string, user: User) => {
  let newFamily = new FamilyModel({
    familyId: familyId,
    ids: [familyId],
    locations: [],
    feed: []
  });
  user.familyId = <string>newFamily.familyId;
  return newFamily;
}

/**
 * @param id
 */
router.get("/feed", auth.ensureLoggedIn, (req,res) => {
  let feed: {name: string, location: string}[] = [];
  UserModel.findById(req.query.id).then((user: User) => {
    if (user) {
      FamilyModel.findOne({familyId: user.familyId}).then((family: Family) => {
        if (family) {
          res.send(family.feed);
        } else {
          family = createFamily(<string>req.query.id,user);
          family.save();
        }
      });
    }
  });
});

/**
 * @param id
 * @param lat
 * @param lon
 */
router.post("/updateLocation", auth.ensureLoggedIn, (req,res) => {
  console.log("I SHOULD BE UPDATING THE LOCATION");
  UserModel.findById(req.body.id).then((user: User) => {
    if (user) {
      if (user.lastLocation === null) {
        user.lastLocation = {lat: <string>req.body.lat, lon: <string>req.body.lon};
      } else {
        user.lastLocation.lat = <string>req.body.lat;
        user.lastLocation.lon = <string>req.body.lon;
      }
      user.save();
      FamilyModel.findOne({familyId: user.familyId}).then((family: Family) => {
        updateFeed(user, family);
      });
      res.send("success");
    }
  });
});


/**
 * 
 * @param user 
 * @param family 
 * @param threashold 
 * 
 * use this to update when user's location has changed (which
 * includes when the user joins the family)
 */
const updateFeed = (user: User, family: Family) => {
  if ( ! family) {
    family = createFamily(user._id,user);
  }
  let locations: string[] = [];
  for (let l = 0; l < family.locations.length; l++) {
    if (getDistanceFromLatLonInMiles(
      Number(family.locations[l].lat),
      Number(family.locations[l].lon),
      Number(user.lastLocation.lat),
      Number(user.lastLocation.lon))
      < THREASHOLD) {
        locations.push(family.locations[l].name);
      }
    // if (Number(family.locations[l].lat) - THREASHOLD < Number(user.lastLocation.lat) && Number(user.lastLocation.lat) < Number(family.locations[l].lat) + THREASHOLD 
    // && Number(family.locations[l].lon) - THREASHOLD < Number(user.lastLocation.lon) && Number(user.lastLocation.lon) < Number(family.locations[l].lon) + THREASHOLD) {
    //   locations.push(family.locations[l].name);
    // }
  }
  let places = "";
  for (let l = 0; l < locations.length; l++) {
    if (l !== locations.length - 1) {
      places += locations[l] + ", ";
    } else {
      places += locations[l];
    }
  }
  if (places === "") {
    places = "Unknown Location";
  }
  let changed = false;
  for (let i = 0; i < family.feed.length; i++) {
    if (family.feed[i].name === user.name) {
      family.feed[i] = {name: user.name, location: places};
      changed = true;
    }
  }
  if (! changed) {
    family.feed.push({name: user.name, location: places});
  }
    // sockets
  for (let i = 0; i < family.ids.length; i++) {
    socketManager.getSocketFromUserID(family.ids[i])?.emit("feed", family.feed);
  }
  family.save();
}

const updateFeedForAll = (family: Family, user: User) => {
  // for add checkpoint function
  if ( ! family) {
    family = createFamily(user._id,user);
  }
  let locations: string[] = [];
  let feed: {name: string, location: string}[] = [];

  UserModel.find({familyId: user.familyId}).then((users: User[]) => {
    for (let u = 0; u < users.length; u++) {
      locations = [];
      for (let l = 0; l < family.locations.length; l++) {
        if (getDistanceFromLatLonInMiles(
          Number(family.locations[l].lat),
          Number(family.locations[l].lon),
          Number(users[u].lastLocation.lat),
          Number(users[u].lastLocation.lon))
          < THREASHOLD) {
            locations.push(family.locations[l].name);
          }
        // if (Number(family.locations[l].lat) - THREASHOLD < Number(users[u].lastLocation.lat) && Number(users[u].lastLocation.lat) < Number(family.locations[l].lat) + THREASHOLD 
        // && Number(family.locations[l].lon) - THREASHOLD < Number(users[u].lastLocation.lon) && Number(users[u].lastLocation.lon) < Number(family.locations[l].lon) + THREASHOLD) {
        //   locations.push(family.locations[l].name);
        // }
      }
      let places = "";
      for (let l = 0; l < locations.length; l++) {
        if (l !== locations.length - 1) {
          places += locations[l] + ", ";
        } else {
          places += locations[l];
        }
      }
      if (places !== "") {
        feed.push({name: users[u].name, location: places});
      }
    }
    family.feed = feed;
    family.save();
  });
  for (let i = 0; i < family.ids.length; i++) {
    socketManager.getSocketFromUserID(family.ids[i])?.emit("feed", family.feed);
    socketManager.getSocketFromUserID(family.ids[i])?.emit("checkpoints", family.locations)
  }
}

/**
 * @param name
 * @param lat
 * @param lon
 * @param id
 */
router.post("/addCheckpoint", auth.ensureLoggedIn, (req,res) => {
  UserModel.findById(req.body.id).then((user: User) => {
    if (user) {
      let obj = {lat: req.body.lat, lon: req.body.lon, name: req.body.name};
      FamilyModel.findOne({familyId: user.familyId}).then((family: Family) => {
        if ( ! family) {
          createFamily(user._id,user);
        }
        if (family.locations === null) {
          family.locations = [obj];
        } else {
          family.locations.push(obj);
        }
        updateFeedForAll(family, user);
        res.send("success");
      });
    }
  });
});

/**
 * @param id
 */
router.get("/checkpoints", auth.ensureLoggedIn, (req,res) => {
  UserModel.findById(req.query.id).then((user: User) => {
    if (user) {
      FamilyModel.findOne({familyId: user.familyId}).then((family: Family) => {
        if (family.locations !== null && family.locations.length !== 0) {
          res.send(family.locations);
        } else {
          res.send("nothing");
        }
      });
    }
  });
});

/**
 * @param senderUserId
 * @param acceptorUserId
 * 
 */
router.post("/reject", auth.ensureLoggedIn, (req,res) => {
  //change user.familyId
  UserModel.findById(req.body.acceptorUserId).then((user: User) => {
    if (user) {
      user.notifications = user.notifications.filter((notification: Notification) => {
        notification.senderId !== req.body.senderUserId;
      });
      user.save();
      socketManager.getSocketFromUserID(req.body.acceptorUserId)?.emit("notifications", user.notifications);
      res.send("success");
    } else {
      res.send("please login");
    }
  });
});


/**
 * @param acceptorUserId
 * @param senderUserId
 * 
 */
router.post("/accept", auth.ensureLoggedIn, (req,res) => {
  // later have a way to LEAVE current family
  UserModel.findById(req.body.senderUserId).then((sender: User) => {
    console.log("ENTERING ACCEPT ON SERVER");
    //add to family db

    FamilyModel.findOne({familyId: <string>sender.familyId}).then((family: Family) => {

      //change user.familyId
      UserModel.findById(req.body.acceptorUserId).then((acceptor: User) => {
        // REMEMBER TO DELETE USER FROM LAST FAMILY
        if (sender !== null && acceptor !== null && sender.familyId === acceptor.familyId) {
          res.send("already in family");
          return;
        }
        if ( ! family.ids.includes(req.body.acceptorId)) {
          family.ids.push(req.body.acceptorUserId);
        }
        FamilyModel.findOne({familyId: <string>acceptor.familyId}).then((oldFamily: Family) => {
          // delete from feed
          // delete from ids
          if (oldFamily) {
            oldFamily.feed = oldFamily.feed.filter((item: {name: string, location:string}) => {
              item.name !== acceptor.name;
            });
            oldFamily.ids = oldFamily.ids.filter((id: string) => {
              id !== <string>acceptor._id;
            });
            oldFamily.save();
          }
        });
        acceptor.familyId = sender.familyId;
        acceptor.notifications = acceptor.notifications.filter((notification: Notification) => {
          notification !== req.body.senderId;
        });
        acceptor.save();

        // now we see if we need to update the feed
        updateFeedForAll(family, sender);
        res.send("success");
      });
    });
  });
});

router.get("/user", auth.ensureLoggedIn, (req,res) => {
  UserModel.findById(req.query.id).then((user: User) => {
    res.send(user);
  });
});

/**
 * @param id
 */
router.get("/notifications", auth.ensureLoggedIn, (req, res) => {
  UserModel.findById(req.query.id).then((user: User) => {
    if (user) {    
      res.send(user.notifications);
    } else {
      res.send("Please login");
    }
  });
});

router.post("/delNotification", (req,res) => {
  UserModel.findById(req.body.id).then((user: User) => {
    user.notifications.shift();
    user.save();
  });
});

/**
 * @param id
 * @param email
 */
router.post("/invite", auth.ensureLoggedIn, (req, res) => {
  console.log("I SHOULD BE INVITING");
  UserModel.findById(req.body.id).then((sender: User) => {
    if (sender.familyId === "") {
      let family: Family = createFamily(req.body.id,sender);
      family.save();
      sender.save();
    }
    UserModel.findOne({email: <string>req.body.email}).then((user: User) => {
      if (user) {
        user.notifications.push({senderName: sender.name, senderId: sender._id});
        user.save();
        socketManager.getSocketFromUserID(user._id)?.emit("notifications", user.notifications);
      }
    });
  });

});


  // vvvvv------- iOS methods use google id -------vvvvv


/**
 * @param id (google id)
 * @param lat
 * @param lon
 */
router.post("/updateLocationGoogleId", (req,res) => {
  let ret: string = "nothing";
  console.log("I SHOULD BE UPDATING THE LOCATION from iOS");
  UserModel.findOne({googleId: req.body.id}).then((user: User) => {
    if (user) {
      if (user.lastLocation === null) {
        user.lastLocation = {lat: <string>req.body.lat, lon: <string>req.body.lon};
      } else {
        ret = req.body.lon;
        user.lastLocation.lat = <string>req.body.lat;
        user.lastLocation.lon = <string>req.body.lon;
      }
      user.save();
      FamilyModel.findOne({familyId: user.familyId}).then((family: Family) => {
        updateFeed(user, family);
      });
    }
  });
  res.send(ret);
});




// anything else falls to this "not found" case
router.all("*", (req, res) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
