"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
// import { Message } from './message';
// import { MessageType } from "../enums";
// import { MessageService } from "../service/message.service";
const response_status_1 = require("../enum/response-status");
/**
 * ApiResponse
 */
class ApiResponse {
    /* ************************************ Constructors ************************************ */
    constructor() {
        this.code = 200;
        this.status = response_status_1.ResponseStatus[response_status_1.ResponseStatus.SUCCESS];
        this.body = null;
        this.data = null;
        this.msg = null;
        this.errorMessage = null;
    }
}
exports.ApiResponse = ApiResponse;
