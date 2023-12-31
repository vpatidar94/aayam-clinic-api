import { OrgVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const orgSchema = new mongoose.Schema({
  appId: String,
  appName: String,
  nameShort: String,
  name: String,
  nameHi: String,
  codeSuffix: String,
  type: String,
  taxpayerId: String,
  icon: String,
  logo: String,
  cover: String,
  address: {
    street1: String,
    street2: String,
    landmark: String,
    city: String,
    zip: String,
    zipext: String,
    state: String,
    country: String,
    ph: String,
    ph2: String,
    cell: String,
    cell2: String,
    fax: String,
    email: String,
    web: String,
    lat: mongoose.Schema.Types.Number,
    lng: mongoose.Schema.Types.Number,
    placeId: String,
    formatted: String,
    created: mongoose.Schema.Types.Date,
    default: mongoose.Schema.Types.Boolean,
    apartmentNo: String,
    dropOffOption: String,
    note: String,
  },
  domain: String,
  tagline: String,
  est: mongoose.Schema.Types.Date,
  reg: String,
  gst: String,
  ph: String,
  email: String,
  status: String,
  del: mongoose.Schema.Types.Boolean,
  modBy: String,
  crtBy: String,
  modified: mongoose.Schema.Types.Date,
  created: mongoose.Schema.Types.Date,

  adminName: String,
  adminCell: String,
  adminDesignation: String,

  expiryPanel: mongoose.Schema.Types.Date,
  category: String // BASIC, STARTER, ENTERPRISE, PREMIUM

});

const orgModel = mongoose.model<OrgVo & mongoose.Document>('Org', orgSchema);

export default orgModel;
