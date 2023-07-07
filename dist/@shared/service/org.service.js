"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgService = void 0;
const org_model_1 = __importDefault(require("../../@shared/model/org.model"));
const users_model_1 = __importDefault(require("../model/users.model"));
class OrgService {
    constructor() {
        this.org = org_model_1.default;
        /* ************************************* Public Methods ******************************************** */
        this.addUpdateOrg = async (org) => {
            try {
                if (org._id) {
                    return await users_model_1.default.findByIdAndUpdate(org._id, org);
                }
                else {
                    const orgExist = await this.org.exists({ name: org.name });
                    if (orgExist) {
                        return null;
                    }
                    return await org_model_1.default.create(org);
                }
            }
            catch (error) {
                throw error;
            }
        };
        this.getOrgById = async (orgId) => {
            return await this.org.findById(orgId);
        };
        this.getOrgNameByIdList = async (orgIdList) => {
            const nameList = {};
            const orgList = await org_model_1.default.find({ _id: { $in: orgIdList } });
            if (orgList && orgList.length > 0) {
                orgList === null || orgList === void 0 ? void 0 : orgList.forEach((org) => {
                    var _a;
                    nameList[org._id] = (_a = org.name) !== null && _a !== void 0 ? _a : '';
                });
            }
            return nameList;
        };
        /* ************************************* Private Methods ******************************************** */
    }
}
exports.OrgService = OrgService;
