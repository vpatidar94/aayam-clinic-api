import { ItemDetailDto, ItemVo, JwtClaimDto, SERVICE_TYPE_STATUS, ServiceTypeVo } from "aayam-clinic-core";
import { Request, Response, Router } from "express";
import { ServiceItemService } from "../../@app/service/service-item.service";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
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
    // /api/core/v1/service-item/app-update
    this.router.post(`${this.path}${URL.ADD_UPDATE}`, (req: Request, res: Response) => {
      (async () => {
        try {
          const body = req.body as ItemVo;
          const claim = res.locals?.claim as JwtClaimDto;

          // if (!AuthUtility.hasOrgEmpAccess(claim, body?.orgId)) {
          //   ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
          //   return;
          // }
          const item = await this.serviceItemService.addUpdateServiceItem(body);
          ResponseUtility.sendSuccess(res, item);
        } catch (error) {
          console.log('xx xxx xxx err ', error);
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/service-item/list
    this.router.get(`${this.path}${URL.LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          const claim = res.locals?.claim as JwtClaimDto;
          // if (!AuthUtility.hasOrgEmpAccess(claim, req.query.orgId as string)) {
          //   ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
          //   return;
          // }
          const list: Array<ItemDetailDto> | null = await this.serviceItemService.getListByOrgId(req.query.orgId as string);
          ResponseUtility.sendSuccess(res, list);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/service-item/investigation-list
    this.router.get(`${this.path}${URL.INVESTIGATION_LIST}`, (req: Request, res: Response) => {
      (async () => {
        try {
          const claim = res.locals?.claim as JwtClaimDto;
          // if (!AuthUtility.hasOrgEmpAccess(claim, req.query.orgId as string)) {
          //   ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
          //   return;
          // }
          const list: Array<any> | null = await this.serviceItemService.getInvestigationService(req.query.orgId as string);
          ResponseUtility.sendSuccess(res, list);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/service-item/service-type-add-update
    this.router.post(`${this.path}${URL.SERVICE_TYPE_ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          // if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
          //   ResponseUtility.sendFailResponse(res, null, 'Not permitted');
          //   return;
          // }
          const userType = await this.serviceItemService.addUpdateServiceType(req.body as ServiceTypeVo);
          if (!userType) {
            ResponseUtility.sendFailResponse(res, null, "Service Type Name not available");
            return;
          }
          ResponseUtility.sendSuccess(res, userType);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/service-item/service-type-list
    this.router.get(`${this.path}${URL.SERVICE_TYPE_LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          // if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
          //   ResponseUtility.sendFailResponse(res, null, 'Not permitted');
          //   return;
          // }
          const list: Array<ServiceTypeVo> | null = await this.serviceItemService.getServiceTypeListByOrgId(req.query.orgId as string);
          ResponseUtility.sendSuccess(res, list);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/service-item/service-type-delete
    this.router.get(`${this.path}${URL.SERVICE_TYPE_DELETE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          // if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
          //   ResponseUtility.sendFailResponse(res, null, 'Not permitted');
          //   return;
          // }
          const serviceType = await this.serviceItemService.getServiceTypeById(req.query?.serviceTypeId as string);
          if (!serviceType || serviceType.del) {
            ResponseUtility.sendFailResponse(res, null, "Service Type not available");
            return;
          }
          serviceType.del = true;
          const update = await this.serviceItemService.addUpdateServiceType(serviceType);
          ResponseUtility.sendSuccess(res, update);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/service-item/service-type-active-inactive
    this.router.get(`${this.path}${URL.SERVICE_TYPE_ACTIVE_INACTIVE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          // if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
          //   ResponseUtility.sendFailResponse(res, null, 'Not permitted');
          //   return;
          // }
          const serviceType = await this.serviceItemService.getServiceTypeById(req.query?.serviceTypeId as string);
          if (!serviceType || serviceType.del) {
            ResponseUtility.sendFailResponse(res, null, "Service Type not available");
            return;
          }
          serviceType.status = serviceType.status == SERVICE_TYPE_STATUS.ACTIVE ? SERVICE_TYPE_STATUS.INACTIVE : SERVICE_TYPE_STATUS.ACTIVE;
          const update = await this.serviceItemService.addUpdateServiceType(serviceType);
          ResponseUtility.sendSuccess(res, update);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

  }
}
export default ServiceItemApi;
