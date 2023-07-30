import { InvestigationVo, OrgVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const investigationSchema = new mongoose.Schema({
    name: String,

    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },

    dr: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    date: Date,
    created: Date,

    url: String,
});

const investigationModel = mongoose.model<InvestigationVo & mongoose.Document>('Investigation', investigationSchema);

export default investigationModel;
