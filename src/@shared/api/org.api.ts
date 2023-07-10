import { OrgVo } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { URL } from '../const/url';
import { Route } from '../interface/route.interface';
import { ResponseUtility } from '../utility/response.utility';
import { OrgService } from '../../@shared/service/org.service';
import authMiddleware from '../../@shared/middleware/auth.middleware';

class OrgApi implements Route {
    public path = URL.MJR_ORG;
    public router = Router();

    private orgService = new OrgService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // /api/core/v1/user/app-update
        this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, async (req: Request, res: Response) => {
            try {
                const user = await this.orgService.addUpdateOrg(req.body as OrgVo);
                if (!user) {
                    ResponseUtility.sendFailResponse(res, null, 'Org Name not available');
                    return;
                }
                ResponseUtility.sendSuccess(res, user);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}
export default OrgApi;
