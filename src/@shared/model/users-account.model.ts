import * as mongoose from 'mongoose';
import { UserAccountVo } from 'aayam-clinic-core';

const userAccountSchema = new mongoose.Schema({
  uid :  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  salaryType: String,
  bankDetail: {
    name: String,
    acNumber: String,
    acType: String,
    acHolderName: String,
    ifsc: String,
    branch: String 
  },
  income: {
    basicSalary: Number,
    da: Number,
    hra: Number,
    others: Number
  },
  deduction: {
    tds: Number,
    pf: Number,
    professinalTax: Number,
    leaveDeduction: Number 
  }
});

const userAccountModel = mongoose.model<UserAccountVo & mongoose.Document>('useraccount', userAccountSchema);

export default userAccountModel;