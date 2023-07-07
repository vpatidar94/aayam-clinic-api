"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../@shared/service/auth.service");
const express_1 = require("express");
const url_1 = require("../const/url");
const response_utility_1 = require("../utility/response.utility");
class AuthApi {
    constructor() {
        this.path = url_1.URL.MJR_AUTH;
        this.router = (0, express_1.Router)();
        this.authService = new auth_service_1.AuthService();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // /api/core/v1/user/app-update
        this.router.post(`${this.path}${url_1.URL.LOGIN}`, async (req, res) => {
            try {
                const body = await req.body;
                const user = await this.authService.authenticate(body.email, body.password);
                if (!user) {
                    response_utility_1.ResponseUtility.sendFailResponse(res, null, 'User already exists');
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
exports.default = AuthApi;
