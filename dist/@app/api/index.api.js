"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class IndexApi {
    constructor() {
        this.path = '/';
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}`, async (req, res, next) => {
            try {
                res.status(200).json({
                    "xx": "xxxxxxxxxx"
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = IndexApi;
