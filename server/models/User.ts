import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: String,
  familyId: String,
  notifications: [String],
  lastLocation: {lat: String, lon: String},
  googleid: String,
});

export interface User extends Document {
  name: string;
  email: string;
  familyId: string;
  notifications: string[];
  lastLocation: {lat: string, lon: string};
  googleid: string;
  _id: string;
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
