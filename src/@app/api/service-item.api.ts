import { ServiceItemService } from "../../@app/service/service-item.service";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
import { ItemVo, OrgVo, ROLE } from "aayam-clinic-core";
import { Request, Response, Router } from "express";
import authMiddleware from "../../@shared/middleware/auth.middleware";
import { ResponseUtility } from "../../@shared/utility/response.utility";

class ServiceItemApi implements Route {
  public path = URL.MJR_SERVICE_ITEM;
  public router = Router();

  private serviceItemService = new ServiceItemService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/org/app-update
    this.router.post(
      `${this.path}${URL.ADD_UPDATE}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            // if (res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) {
            //   ResponseUtility.sendFailResponse(
            //     res,
            //     null,
            //     "You are not authorized to create Org"
            //   );
            //   return;
            // }
            const item = await this.serviceItemService.addUpdateServiceItem(
              req.body as ItemVo
            );
            ResponseUtility.sendSuccess(res, item);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    // /api/core/v1/org/list
    this.router.get(
      `${this.path}${URL.LIST}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            // if (res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) {
            //   ResponseUtility.sendFailResponse(res, null, "Not permitted");
            //   return;
            // }
            const list: Array<ItemVo> | null = await this.serviceItemService.getListByOrgId(req.query.orgId as string);
            ResponseUtility.sendSuccess(res, list);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );
  }
}
export default ServiceItemApi;
