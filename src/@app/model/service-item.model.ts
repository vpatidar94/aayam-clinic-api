import { ItemVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const getPrice = (num: number): number => {
  return num / 100;
};

const setPrice = (num: number): number => {
  return num * 100;
};

const schema = new mongoose.Schema({
  org: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  br: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  name: String,
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  price: { type: Number, get: getPrice, set: setPrice }, // Price in lowest unit
  taxInclusive: Boolean,
  igst: Number,
  cgst: Number,
  sgst: Number,
  active: Boolean,
});

const model = mongoose.model<ItemVo & mongoose.Document>("ServiceItem", schema);

export default model;
