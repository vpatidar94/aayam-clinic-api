import { NextFunction, Request, Response } from "express";
declare const passwordMiddleware: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default passwordMiddleware;
