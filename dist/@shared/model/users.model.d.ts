import * as mongoose from 'mongoose';
import { UserVo } from 'aayam-clinic-core';
declare const userModel: mongoose.Model<UserVo & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, UserVo & mongoose.Document<any, any, any>> & Omit<UserVo & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, never>, any>;
export default userModel;
