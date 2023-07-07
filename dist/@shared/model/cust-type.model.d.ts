import * as mongoose from 'mongoose';
import { CustTypeVo } from "aayam-clinic-core";
declare const custTypeModel: mongoose.Model<CustTypeVo & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, CustTypeVo & mongoose.Document<any, any, any>> & Omit<CustTypeVo & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, never>, any>;
export default custTypeModel;
