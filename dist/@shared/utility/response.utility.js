"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtility = void 0;
const response_status_1 = require("../enum/response-status");
const api_response_1 = require("../interface/api-response");
class ResponseUtility {
    static sendSuccess(res, body, msg = '') {
        const apiResponse = new api_response_1.ApiResponse();
        apiResponse.body = body;
        apiResponse.code = 200;
        apiResponse.status = response_status_1.ResponseStatus[response_status_1.ResponseStatus.SUCCESS];
        apiResponse.msg = msg;
        res.status(200).send(apiResponse);
    }
    static sendFailResponse(res, e, msg = '', code = 500) {
        const apiResponse = new api_response_1.ApiResponse();
        apiResponse.body = e;
        apiResponse.code = code;
        apiResponse.msg = msg;
        apiResponse.status = response_status_1.ResponseStatus[response_status_1.ResponseStatus.FAIL];
        res.status(code).send(apiResponse);
    }
}
exports.ResponseUtility = ResponseUtility;
