import { MetadataOrgVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const metaOrgSchema = new mongoose.Schema({

  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },

  no: Number,
  patientNo: Number,
  departmentNo: Number,
  userTypeNo: Number,
  serviceTypeNo: Number,
  serviceItemNo: Number,
  userNo: Number,
  productNo: Number,
  pharmacyOrderNo: Number
});

const metaOrgModel = mongoose.model<MetadataOrgVo & mongoose.Document>('MetaOrg', metaOrgSchema);

export default metaOrgModel;
