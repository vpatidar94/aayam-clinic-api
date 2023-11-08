import { InvestigationParamService } from "../../@app/service/investigation-param.service";
import { InvestigationParamVo, ROLE } from "aayam-clinic-core";
import { Request, Response, Router } from "express";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
import authMiddleware from "../../@shared/middleware/auth.middleware";
import { ResponseUtility } from "../../@shared/utility/response.utility";
import { BookingService } from "../../@app/service/booking.service";

class InvestigationApi implements Route {
  public path = URL.MJR_INVESTIGATION;
  public router = Router();

  private investigationParamService = new InvestigationParamService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/investigation/add-update
    this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if (
            res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
            res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
          ) {
            ResponseUtility.sendFailResponse(res, null, "Not permitted");
            return;
          }
          const param = await this.investigationParamService.addUpdateInvestigationParam(req.body as InvestigationParamVo);
          ResponseUtility.sendSuccess(res, param);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    });

    // /api/core/v1/investigation/param-list
    this.router.get(`${this.path}${URL.INVESTIGATION_PARAM_LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if (
            res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
            res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
          ) {
            ResponseUtility.sendFailResponse(res, null, "Not permitted");
            return;
          }
          const list = await this.investigationParamService.getInvestigationParam(req.query.orgId as string);
          ResponseUtility.sendSuccess(res, list);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    });

    // /api/core/v1/investigation/patient-list
    this.router.get(`${this.path}${URL.INVESTIGATION_PATIENT_LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if (
            res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
            res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
          ) {
            ResponseUtility.sendFailResponse(res, null, "Not permitted");
            return;
          }
          const list = await new BookingService().getInvestigationPatient(req.query?.orgId as string);
          ResponseUtility.sendSuccess(res, list);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    });
  }
}

export default InvestigationApi;
