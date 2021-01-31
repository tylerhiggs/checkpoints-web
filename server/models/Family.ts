import { Schema, model, Document } from "mongoose";

const FamilySchema = new Schema({
  familyId: String,
  ids: [String],
  locations: [{name: String, lat: Number, lon: Number}],
  feed: [{name: String, location: String}],
});

export interface Family extends Document {
  familyId: string;
  ids: string[];
  locations: {name: string, lat: number, lon: number}[];
  feed: {name: string, location: string}[];
  _id: string;
}

const FamilyModel = model<Family>("Family", FamilySchema);

export default FamilyModel;