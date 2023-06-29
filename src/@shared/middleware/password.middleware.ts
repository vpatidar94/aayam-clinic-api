import {NextFunction, Request, Response} from "express";
import * as jwt from 'jsonwebtoken';
import * as dotenv from "dotenv";

const passwordMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.headers.authorization) {
            const token = req?.headers?.authorization.split(" ")[1];
            dotenv.config();
            const secret = process.env.JWT_SECRET_PASSWORD as string;
            req.body.claim = jwt.verify(token, secret);
            next();
        } else {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};
export default passwordMiddleware;
