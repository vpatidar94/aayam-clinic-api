import { InvestigationParamVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const investigationParamSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    testName: String,
    testCode: String,
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    specimen: String,
    charge: Number,
    params: [{
        name: String,
        geneder: Array<String>,
        ageGroup: String,
        criteriaList: [{
            testName: String,
            ref: String,
            unit: String
        }]
    }],
});

const investigationParamModel = mongoose.model<InvestigationParamVo & mongoose.Document>('InvestigationParam', investigationParamSchema);

export default investigationParamModel;
