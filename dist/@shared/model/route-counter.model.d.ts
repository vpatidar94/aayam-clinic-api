import * as mongoose from 'mongoose';
import { RouteCounterVo } from "aayam-clinic-core";
declare const routeCounterModel: mongoose.Model<RouteCounterVo & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, RouteCounterVo & mongoose.Document<any, any, any>> & Omit<RouteCounterVo & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, never>, any>;
export default routeCounterModel;
