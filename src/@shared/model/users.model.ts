import * as mongoose from 'mongoose';
import { UserVo } from 'aayam-clinic-core';

const userSchema = new mongoose.Schema({
  sub: String,
  cover: String,
  cust: [
    {
      enrollAt: Date,
      role: String,
      orgId: String,
      brId: String,
      active: Boolean
    }
  ],
  emp: [
    {
      role: String,
      orgId: String,
      brId: String,
      active: Boolean
    }
  ],
  crtBy: String,
  created: Date,
  title: String,
  nameF: String,
  nameM: String,
  nameL: String,
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
});

const userModel = mongoose.model<UserVo & mongoose.Document>('User', userSchema);

export default userModel;
