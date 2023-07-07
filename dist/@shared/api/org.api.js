"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const url_1 = require("../const/url");
const response_utility_1 = require("../utility/response.utility");
const org_service_1 = require("../../@shared/service/org.service");
class OrgApi {
    constructor() {
        this.path = url_1.URL.MJR_ORG;
        this.router = (0, express_1.Router)();
        this.orgService = new org_service_1.OrgService();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // /api/core/v1/user/app-update
        this.router.post(`${this.path}${url_1.URL.ADD_UPDATE}`, async (req, res) => {
            try {
                const user = await this.orgService.addUpdateOrg(req.body);
                if (!user) {
                    response_utility_1.ResponseUtility.sendFailResponse(res, null, 'Org Name not available');
                    return;
                }
                response_utility_1.ResponseUtility.sendSuccess(res, user);
            }
            catch (error) {
                response_utility_1.ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}
exports.default = OrgApi;
