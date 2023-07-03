import * as mongoose from 'mongoose';
import { UserAuthVo } from 'aayam-clinic-core';

const schema = new mongoose.Schema({
  email: String,
  password: String,
  passwordTemp: Boolean
});

const userAuthModel = mongoose.model<UserAuthVo & mongoose.Document>('UserAuth', schema);

export default userAuthModel;
