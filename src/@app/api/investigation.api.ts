import { Request, Response, Router } from "express";
import { BookingService } from "../../@app/service/booking.service";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
import authMiddleware from "../../@shared/middleware/auth.middleware";
import { ResponseUtility } from "../../@shared/utility/response.utility";

class InvestigationApi implements Route {
  public path = URL.MJR_INVESTIGATION;
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/investigation/patient-list
    this.router.get(`${this.path}${URL.INVESTIGATION_PATIENT_LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          // if (
          //   res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
          //   res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
          // ) {
          //   ResponseUtility.sendFailResponse(res, null, "Not permitted");
          //   return;
          // }
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
