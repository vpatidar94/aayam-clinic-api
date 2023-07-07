import { OrgVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';
declare const orgModel: mongoose.Model<OrgVo & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, OrgVo & mongoose.Document<any, any, any>> & Omit<OrgVo & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, never>, any>;
export default orgModel;
