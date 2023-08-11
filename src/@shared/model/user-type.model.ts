import { UserTypeVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const userTypeSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  name : {type : String},
  code : {type : String},
  status: String,
  del: mongoose.Schema.Types.Boolean,
  modBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  crtBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modified: mongoose.Schema.Types.Date,
  created: mongoose.Schema.Types.Date,
},{
  toJSON: {
    getters: true,
    setters: true
  },
  toObject: {
    getters: true,
    setters: true
  }
});

userTypeSchema.virtual('Department', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true,
});

const userTypeModel = mongoose.model<UserTypeVo & mongoose.Document>('usertype', userTypeSchema);

export default userTypeModel;
