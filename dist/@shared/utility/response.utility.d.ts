import { Response } from "express";
export declare class ResponseUtility {
    static sendSuccess(res: Response, body: any, msg?: string): void;
    static sendFailResponse(res: Response, e: any, msg?: string, code?: number): void;
}
