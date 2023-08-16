import { ServiceTypeVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const serviceTypechema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  name: String,
  code: String,
  doctorAssociated: mongoose.Schema.Types.Boolean,
  status: String,
  del: mongoose.Schema.Types.Boolean,
  modBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  crtBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modified: mongoose.Schema.Types.Date,
  created: mongoose.Schema.Types.Date,
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

const serviceTypeModel = mongoose.model<ServiceTypeVo & mongoose.Document>("serviceType", serviceTypechema);

export default serviceTypeModel;
