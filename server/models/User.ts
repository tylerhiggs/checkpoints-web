import { Schema, model, Document } from "mongoose";
import Notification from "./Notification";

const UserSchema = new Schema({
  name: String,
  email: String,
  familyId: String,
  notifications: [{senderId: String, senderName: String}],
  lastLocation: {lat: String, lon: String},
  googleid: String,
});

export interface User extends Document {
  name: string;
  email: string;
  familyId: string;
  notifications: Notification[];
  lastLocation: {lat: string, lon: string};
  googleid: string;
  _id: string;
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
