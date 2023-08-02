import { MetadataOrgVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const metaOrgSchema = new mongoose.Schema({

  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },

  no: Number,
  patientNo: Number
});

const metaOrgModel = mongoose.model<MetadataOrgVo & mongoose.Document>('MetaOrg', metaOrgSchema);

export default metaOrgModel;
