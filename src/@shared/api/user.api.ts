import { UserVo } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { URL } from '../const/url';
import { Route } from '../interface/route.interface';
import authMiddleware from "../middleware/auth.middleware";
import { UserService } from '../service/user.service';
import { ResponseUtility } from '../utility/response.utility';

class UserApi implements Route {
    public path = URL.MJR_USER;
    public router = Router();

    private userService = new UserService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // /api/core/v1/user/app-update
        this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, async (req: Request, res: Response) => {
            try {
                const user = await this.userService.saveUser(req.body as UserVo);
                if (!user) {
                    ResponseUtility.sendFailResponse(res, null, 'User already exists');
                    return;
                }
                ResponseUtility.sendSuccess(res, user);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}
export default UserApi;
