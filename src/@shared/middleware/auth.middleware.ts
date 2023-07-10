import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { FirebaseUtility } from "../../@shared/utility/firebase.utiliy";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    (
        async () => {
            try {
                if (req.headers.authorization) {
                    const token = req?.headers?.authorization.split(" ")[1];
                    dotenv.config();
                    const auth = FirebaseUtility.getApp().auth();
                    res.locals.claim = await auth.verifyIdToken(token);
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
        }
    )();
};
export default authMiddleware;
