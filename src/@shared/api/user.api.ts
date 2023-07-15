import { JwtClaimDto, UserAccessDetailDto, UserEmpDto, UserVo } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { AuthUtility } from '../../@shared/utility/auth.utility';
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

        this.router.post(`${this.path}${URL.STAFF_ADD_UPDATE}`, authMiddleware, async (req: Request, res: Response) => {
            try {
                const body = req.body as UserEmpDto;
                const claim = res.locals?.claim as JwtClaimDto;
                if (!AuthUtility.hasOrgAccess(claim, body?.acl?.orgId)) {
                    ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                    return;
                }
                const user = await this.userService.saveStaff(body);
                if (!user) {
                    ResponseUtility.sendFailResponse(res, null, 'User already exists');
                    return;
                }
                ResponseUtility.sendSuccess(res, user);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });

        this.router.get(`${this.path}${URL.STAFF_LIST}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const claim = res.locals?.claim as JwtClaimDto;
                    if (!AuthUtility.hasOrgAccess(claim, req.query?.orgId as string)) {
                        ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                        return;
                    }
                    const userList: Array<UserVo> | null = await this.userService.getOrgUserList(req.query?.orgId as string);
                    ResponseUtility.sendSuccess(res, userList);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });

        this.router.get(`${this.path}${URL.ACCESS_LIST}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const claim = res.locals?.claim as JwtClaimDto;
                    const accessList: UserAccessDetailDto | null = await this.userService.getUserAllAccessList(claim);
                    ResponseUtility.sendSuccess(res, accessList);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });
    }
}
export default UserApi;
