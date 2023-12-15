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
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  serviceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "serviceType" },
  associatedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  name: String,
  code: String,
  fee: Number,
  feeType: {
    isPercent: mongoose.Schema.Types.Boolean,
    value: { type: Number }
  },
  doctorFee: Number,
  orgFee: Number,
  status: String,
  del: mongoose.Schema.Types.Boolean,
  modBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  crtBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modified: mongoose.Schema.Types.Date,
  created: mongoose.Schema.Types.Date,

  investigationParam: {
    specimen: String,
    params: [{
      name: String,
      gender: Array<String>,
      ageGroup: String,
      criteriaList: [{
        testName: String,
        ref: String,
        unit: String
      }]
    }]
  }

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


const model = mongoose.model<ItemVo & mongoose.Document>("serviceItem", schema);

export default model;
