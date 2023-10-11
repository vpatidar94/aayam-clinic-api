import { DepartmentVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  name: { type: String },
  code: { type: String },
  type: String,
  status: String,
  del: mongoose.Schema.Types.Boolean,
  modBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  crtBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modified: mongoose.Schema.Types.Date,
  created: mongoose.Schema.Types.Date,
});

const departmentModel = mongoose.model<DepartmentVo & mongoose.Document>('Department', departmentSchema);

export default departmentModel;
