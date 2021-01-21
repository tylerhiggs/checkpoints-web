import { Schema, model, Document } from "mongoose";

const FamilySchema = new Schema({
  familyId: String,
  ids: [String],
  locations: [{name: String, lat: Number, lon: Number}],
});

export interface Family extends Document {
  familyId: string;
  ids: string[];
  locations: {name: string, lat: number, lon: number}[];
  _id: string;
}

const FamilyModel = model<Family>("Family", FamilySchema);

export default FamilyModel;