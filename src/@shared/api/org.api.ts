import { OrgVo, ROLE } from 'aayam-clinic-core';
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

        // /api/core/v1/org/app-update
        this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
            (
                async () => {
                    try {
                        if (res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) {
                            ResponseUtility.sendFailResponse(res, null, 'You are not authorized to create Org');
                            return;
                        }
                        const org = await this.orgService.addUpdateOrg(req.body as OrgVo);
                        if (!org) {
                            ResponseUtility.sendFailResponse(res, null, 'Org Name not available');
                            return;
                        }
                        ResponseUtility.sendSuccess(res, org);
                    } catch (error) {
                        ResponseUtility.sendFailResponse(res, error);
                    }
                }
            )();
        });

        // /api/core/v1/org/list
        this.router.get(`${this.path}${URL.LIST}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    if (res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) {
                        ResponseUtility.sendFailResponse(res, null, 'Not permitted');
                        return;
                    }
                    const orgList: Array<OrgVo> = await this.orgService.getAll();
                    ResponseUtility.sendSuccess(res, orgList);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });
    }
}
export default OrgApi;
