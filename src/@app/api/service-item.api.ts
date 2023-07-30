import { ItemDetailDto, ItemPopulateVo, ItemVo, JwtClaimDto } from "aayam-clinic-core";
import { Request, Response, Router } from "express";
import { ServiceItemService } from "../../@app/service/service-item.service";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
import authMiddleware from "../../@shared/middleware/auth.middleware";
import { AuthUtility } from "../../@shared/utility/auth.utility";
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
            const body = req.body as ItemVo;
            const claim = res.locals?.claim as JwtClaimDto;
            if (!AuthUtility.hasOrgEmpAccess(claim, body?.orgId)) {
              ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
              return;
            }
            const item = await this.serviceItemService.addUpdateServiceItem(body);
            ResponseUtility.sendSuccess(res, item);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    // /api/core/v1/org/list
    this.router.get(`${this.path}${URL.LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          const claim = res.locals?.claim as JwtClaimDto;
          if (!AuthUtility.hasOrgEmpAccess(claim, req.query.orgId as string)) {
            ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
            return;
          }
          const list: Array<ItemDetailDto> | null = await this.serviceItemService.getListByOrgId(req.query.orgId as string);
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
