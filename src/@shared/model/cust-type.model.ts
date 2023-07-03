import * as mongoose from 'mongoose';
import { CustTypeVo, DEPT } from "aayam-clinic-core";

const schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: [DEPT.DISTRIBUTION, DEPT.COUNTER]
    },
    routeCounterId: { type: mongoose.Schema.Types.ObjectId, ref: 'route_counter' },
});

const custTypeModel = mongoose.model<CustTypeVo & mongoose.Document>('cust_type', schema);

export default custTypeModel;
