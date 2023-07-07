import * as mongoose from 'mongoose';
import { EmpDepartmentVo } from "aayam-clinic-core";
declare const empDepartmentModel: mongoose.Model<EmpDepartmentVo & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, EmpDepartmentVo & mongoose.Document<any, any, any>> & Omit<EmpDepartmentVo & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, never>, any>;
export default empDepartmentModel;
