import * as mongoose from 'mongoose';
import { UserVo } from 'aayam-clinic-core';

const userSchema = new mongoose.Schema({
  title: String,
  nameF: String,
  nameM: String,
  nameL: String,
  fatherName: String,
  cell: String,
  email: String,
  cell2: String,
  email2: String,
  img: String,
  doB: Date,
  doD: Date,
  doA: Date,
  poB: String,
  gender: String,
  sub: String,
  cover: String,
  cust: mongoose.Schema.Types.Mixed,
  emp: mongoose.Schema.Types.Mixed,
  crtBy: String,
  created: Date,
  code: String,
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
  serviceTiming:[
    {
      from : String, 
      to : String
    }
  ]
});

// this userSchema.index is newly added to apply monodb search to search the any text from the userModel and hence show that entry in table
userSchema.index({
  'cell': 'text',
  'cell2': 'text',
  'nameF':'text',
  'nameL':'text',
});

const userModel = mongoose.model<UserVo & mongoose.Document>('User', userSchema);

export default userModel;
