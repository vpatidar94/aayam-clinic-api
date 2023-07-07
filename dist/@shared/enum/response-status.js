"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = void 0;
/*
ResponseStatus.FAIL == 1 // index
ResponseStatus[ResponseStatus.FAIL] == 'FAIL' //value

JS
  ResponseStatus[ResponseStatus['FAIL'] = 1] = 'FAIL';
 */
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["SUCCESS"] = 0] = "SUCCESS";
    ResponseStatus[ResponseStatus["FAIL"] = 1] = "FAIL";
    ResponseStatus[ResponseStatus["ERROR"] = 2] = "ERROR";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
