"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const url_1 = require("../const/url");
const user_service_1 = require("../service/user.service");
const response_utility_1 = require("../utility/response.utility");
class UserApi {
    constructor() {
        this.path = url_1.URL.MJR_USER;
        this.router = (0, express_1.Router)();
        this.userService = new user_service_1.UserService();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // /api/core/v1/user/app-update
        this.router.post(`${this.path}${url_1.URL.ADD_UPDATE}`, async (req, res) => {
            try {
                const user = await this.userService.saveUser(req.body);
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
exports.default = UserApi;
