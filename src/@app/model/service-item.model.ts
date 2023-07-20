import { ItemVo, UserVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const getPrice = (num: number): number => {
  return num / 100;
};

const setPrice = (num: number): number => {
  return num * 100;
};

const setUser = (user: UserVo | string): string => {
  if (typeof user === "string") {
    return user;
  }
  return user._id;
}

const schema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  name: String,
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", set: setUser },
  price: { type: Number, get: getPrice, set: setPrice }, // Price in lowest unit
  taxInclusive: Boolean,
  igst: Number,
  cgst: Number,
  sgst: Number,
  active: Boolean,
}, {
  toJSON: {
    getters: true,
    setters: true
  },
  toObject: {
    getters: true,
    setters: true
  }
});

schema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});


const model = mongoose.model<ItemVo & mongoose.Document>("ServiceItem", schema);

export default model;
