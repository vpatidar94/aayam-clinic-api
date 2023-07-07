import * as mongoose from 'mongoose';
import { UserAuthVo } from 'aayam-clinic-core';
declare const userAuthModel: mongoose.Model<UserAuthVo & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, UserAuthVo & mongoose.Document<any, any, any>> & Omit<UserAuthVo & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, never>, any>;
export default userAuthModel;
