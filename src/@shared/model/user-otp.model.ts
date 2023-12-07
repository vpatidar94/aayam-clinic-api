import { UserOtpVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const userOtpSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  empCode: String,
  otp: Number,
  created: {
    type: Date,
    default: Date.now
  },
  cell: String
});

userOtpSchema.index({ created: 1 }, { expireAfterSeconds: 900 });

const userOtpModel = mongoose.model<UserOtpVo & mongoose.Document>('UserOtp', userOtpSchema);

export default userOtpModel;
