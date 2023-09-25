import {
  JwtClaimDto,
  OrgBookingCountDto,
  UserBookingDto,
  UserBookingInvestigationDto,
  BookingAddTransactionDto,
  ROLE,
  PharmacyOrderVo,
} from "aayam-clinic-core";
import { Request, Response, Router } from "express";
import { PharmacyService } from "../service/pharmacy.service";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
import authMiddleware from "../../@shared/middleware/auth.middleware";
import { AuthUtility } from "../../@shared/utility/auth.utility";
import { ResponseUtility } from "../../@shared/utility/response.utility";
import { PdfService } from "../../@app/service/pdf.service";

class PharmacyApi implements Route {
  public path = URL.MJR_PHARMACY;
  public router = Router();

  private pharmacyService = new PharmacyService();
  private pdfService = new PdfService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/pharmacy/order-add-update
    this.router.post(
      `${this.path}${URL.ORDER_ADD_UPDATE}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            const body = req.body as PharmacyOrderVo;
            const claim = res.locals?.claim as JwtClaimDto;
            if (!AuthUtility.hasOrgEmpAccess(claim, body?.orgId)) {
              ResponseUtility.sendFailResponse(res, null, "Unauthorized");
              return;
            }
            const pharmacyOrder = await this.pharmacyService.addUpdateOrder(
              body
            );
            ResponseUtility.sendSuccess(res, pharmacyOrder);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );
    // /api/core/v1/pharmacy/order-list-by-org
    this.router.get(
      `${this.path}${URL.ORDER_LIST_BY_ORG}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            const claim = res.locals?.claim as JwtClaimDto;
            const orgId = req.query.orgId as string;
            const pageNumber = Number(req.query.pageNumber as string);
            const maxRecord = Number(req.query.maxRecord as string);
            const offset = maxRecord * pageNumber - maxRecord;
            if (!AuthUtility.hasOrgEmpAccess(claim, orgId)) {
              ResponseUtility.sendFailResponse(res, null, "Unauthorized");
              return;
            }
            const orders = await this.pharmacyService.getOrgOrders(
              orgId,
              maxRecord,
              offset
            );
            ResponseUtility.sendSuccess(res, orders);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    // /api/core/v1/booking/transaction-add-update
    // this.router.post(
    //   `${this.path}${URL.TRANSACTION_ADD_UPDATE}`,
    //   authMiddleware,
    //   (req: Request, res: Response) => {
    //     (async () => {
    //       try {
    //         const body = req.body as BookingAddTransactionDto;
    //         const claim = res.locals?.claim as JwtClaimDto;
    //         if (
    //           res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
    //           res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
    //         ) {
    //           ResponseUtility.sendFailResponse(res, null, "Not permitted");
    //           return;
    //         }
    //         const userBooking =
    //           await this.bookingService.addUpdateBookingTransaction(body);
    //         ResponseUtility.sendSuccess(res, userBooking);
    //       } catch (error) {
    //         ResponseUtility.sendFailResponse(res, error);
    //       }
    //     })();
    //   }
    // );

    // /api/core/v1/booking/receipt-create
    // this.router.get(
    //   `${this.path}${URL.RECEIPT_CREATE}`,
    //   authMiddleware,
    //   (req: Request, res: Response) => {
    //     (async () => {
    //       try {
    //         if (
    //           res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
    //           res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
    //         ) {
    //           ResponseUtility.sendFailResponse(res, null, "Not permitted");
    //           return;
    //         }
    //         await this.pdfService.createOrderReceipt(req.query.bookingId as string, res);
    //       } catch (error) {
    //         ResponseUtility.sendFailResponse(res, error);
    //       }
    //     })();
    //   }
    // );
  }
}
export default PharmacyApi;
