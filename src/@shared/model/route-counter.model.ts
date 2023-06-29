import * as mongoose from 'mongoose';
import {DEPT, EmpDepartmentVo, RouteCounterVo} from "codeartist-core";

const schema = new mongoose.Schema({
  type: {
    type: String,
    enum: [DEPT.DISTRIBUTION, DEPT.COUNTER]
  },
  name: String
});

const routeCounterModel = mongoose.model<RouteCounterVo & mongoose.Document>('route_counter', schema);

export default routeCounterModel;
