import * as mongoose from 'mongoose';
import { DEPT, EmpDepartmentVo } from "aayam-clinic-core";

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: [DEPT.DISTRIBUTION, DEPT.COUNTER]
    },
    routeCounterId: { type: mongoose.Schema.Types.ObjectId, ref: 'route_counter' },
});

const empDepartmentModel = mongoose.model<EmpDepartmentVo & mongoose.Document>('EmpDepartment', schema);

export default empDepartmentModel;
