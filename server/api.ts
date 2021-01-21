import express from "express";
import auth from "./auth";
import socketManager from "./server-socket";
import UserModel, { User } from "./models/User";
import FamilyModel, { Family } from "./models/Family";
const router = express.Router();

router.post("/login", auth.login);
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


/**
 * @param id
 */
router.get("/feed", (req,res) => {
  const threashold = 10;
  let feed: {name: string, location: string}[] = [];
  UserModel.findById(req.query.id).then((user: User) => {
    if (user) {
      if (user.familyId === "") {
        const newFamily = new FamilyModel({
          familyId: req.query.id,
          ids: [req.query.id],
          locations: [],
        });
        newFamily.save();
        user.familyId = <string>req.query.id;
        user.save();
      }
      FamilyModel.findOne({familyId: user.familyId}).then((family: Family) => {
        if (family) {
          UserModel.find({familyId: user.familyId}).then((users: User[]) => {
            console.log("HERE ARE MANY USERS");
            console.log(users);
            console.log(family.locations);
            for (let u = 0; u < users.length; u++) {
              for (let l = 0; l < family.locations.length; l++) {
                if (Number(family.locations[l].lat) - threashold < Number(users[u].lastLocation.lat) && Number(users[u].lastLocation.lat) < Number(family.locations[l].lat) + threashold 
                  && Number(family.locations[l].lon) - threashold < Number(users[u].lastLocation.lon) && Number(users[u].lastLocation.lon) < Number(family.locations[l].lon) + threashold) {
                    console.log('HOW DID I MAKE IT HERE');
                    feed.push({name: users[u].name, location: family.locations[l].name});
                    console.log(feed);
                    break;
                }
              }
            }
            console.log(feed);
            if (feed !== null) {
              res.send(feed);
            }
          });
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
router.post("/updateLocation", (req,res) => {
  UserModel.findById(req.body.id).then((user: User) => {
    if (user) {
      if (user.lastLocation === null) {
        user.lastLocation = {lat: <string>req.body.lat, lon: <string>req.body.lon};
      } else {
        user.lastLocation.lat = <string>req.body.lat;
        user.lastLocation.lon = <string>req.body.lon;
      }
      user.save();
    }
  });
});

/**
 * @param name
 * @param lat
 * @param lon
 * @param id
 */
router.post("/addCheckpoint", (req,res) => {
  UserModel.findById(req.body.id).then((user: User) => {
    if (user) {
      let obj = {lat: req.body.lat, lon: req.body.lon, name: req.body.name};
      FamilyModel.findOne({familyId: user.familyId}).then((family: Family) => {
        console.log('HERE HERE!!!');
        if (family.locations === null) {
          family.locations = [obj];
        } else {
          family.locations.push(obj);
          family.save();
        }
      });
    }
  });
});

/**
 * @param id
 */
router.get("/checkpoints", (req,res) => {
  UserModel.findById(req.query.id).then((user: User) => {
    if (user.familyId === "") {
      const newFamily = new FamilyModel({
        familyId: req.query.id,
        ids: [req.query.id],
        locations: [],
      });
      newFamily.save();
      user.familyId = <string>req.query.id;
      user.save();
    }
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
router.post("/reject", (req,res) => {
  //change user.familyId
  UserModel.findById(req.body.acceptorUserId).then((user: User) => {
    if (user) {
      user.notifications = user.notifications.filter((notification: String) => {
        return notification !== req.body.senderUserId;
      });
      user.save();
      res.send("success");
    }
  });
});


/**
 * @param acceptorUserId
 * @param senderUserId
 * 
 */
router.post("/accept", (req,res) => {
  // later have a way to LEAVE current family
  UserModel.findById(req.body.senderUserId).then((sender: User) => {
    console.log("ENTERING ACCEPT ON SERVER");
    //add to family db
    FamilyModel.findOne({familyId: <string>sender.familyId}).then((family: Family) => {
      family.ids.push(req.body.acceptorUserId);
      family.save();
      console.log("I ADDED TO THE FAMILY");
    });
    //change user.familyId
    UserModel.findById(req.body.acceptorUserId).then((acceptor: User) => {
      acceptor.familyId = sender.familyId;
      acceptor.notifications = acceptor.notifications.filter((notification: String) => {
        return notification !== sender.familyId;
      });
      acceptor.save();
    });
  });
});

router.get("/user", (req,res) => {
  UserModel.findById(req.query.id).then((user: User) => {
    res.send(user);
  });
});

router.get("/notifications", (req, res) => {
  console.log("MADE IT MADE IT");
  UserModel.findById(req.query.id).then((user: User) => {
    console.log(user.notifications);
    res.send(user.notifications);
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
router.post("/invite", (req, res) => {
  UserModel.findById(req.body.id).then((user: User) => {
    if (user.familyId === "") {
      const newFamily = new FamilyModel({
        familyId: req.body.id,
        ids: [req.body.id],
        locations: [],
      });
      newFamily.save();

      user.familyId = req.body.id;
      user.save();
    }
    UserModel.findOne({email: <string>req.body.email}).then((user: User) => {
      user.notifications = user.notifications.concat([<string>req.body.id]);
      user.save();
    });
  });



});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  const msg = `Api route not found: ${req.method} ${req.url}`;
  res.status(404).send({ msg });
});

export default router;
