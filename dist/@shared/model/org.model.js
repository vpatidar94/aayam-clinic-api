"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const orgSchema = new mongoose.Schema({
    appId: String,
    appName: String,
    nameShort: String,
    name: String,
    nameHi: String,
    type: String,
    taxpayerId: String,
    icon: String,
    logo: String,
    cover: String,
    address: {
        street1: String,
        street2: String,
        landmark: String,
        city: String,
        zip: String,
        zipext: String,
        state: String,
        country: String,
        ph: String,
        ph2: String,
        cell: String,
        cell2: String,
        fax: String,
        email: String,
        web: String,
        lat: mongoose.Schema.Types.Number,
        lng: mongoose.Schema.Types.Number,
        placeId: String,
        formatted: String,
        created: mongoose.Schema.Types.Date,
        default: mongoose.Schema.Types.Boolean,
        apartmentNo: String,
        dropOffOption: String,
        note: String,
    },
    domain: String,
    tagline: String,
    est: mongoose.Schema.Types.Date,
    reg: String,
    ph: String,
    email: String,
    status: String,
    del: mongoose.Schema.Types.Boolean,
    modBy: String,
    crtBy: String,
    modified: mongoose.Schema.Types.Date,
    created: mongoose.Schema.Types.Date,
});
const orgModel = mongoose.model('Org', orgSchema);
exports.default = orgModel;
