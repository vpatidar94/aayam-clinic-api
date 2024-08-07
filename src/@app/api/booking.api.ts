import {
  JwtClaimDto,
  OrgBookingCountDto,
  UserBookingDto,
  UserBookingInvestigationDto,
  BookingAddTransactionDto,
  ROLE,
  PATIENT_TYPE,
} from "aayam-clinic-core";
import { Request, Response, Router } from "express";
import { BookingService } from "../../@app/service/booking.service";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
import authMiddleware from "../../@shared/middleware/auth.middleware";
import { ResponseUtility } from "../../@shared/utility/response.utility";
import { PdfService } from "../../@app/service/pdf.service";

class BokingApi implements Route {
  public path = URL.MJR_BOOKING;
  public router = Router();

  private bookingService = new BookingService();
  private pdfService = new PdfService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/booking/add-update
    this.router.post(
      `${this.path}${URL.ADD_UPDATE}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            const body = req.body as UserBookingDto;
            const claim = res.locals?.claim as JwtClaimDto;
            // if (!AuthUtility.hasOrgEmpAccess(claim, body?.booking?.orgId)) {
            //   ResponseUtility.sendFailResponse(res, null, "Unauthorized");
            //   return;
            // }
            const userBooking = await this.bookingService.addUpdateBooking(
              body
            );
            ResponseUtility.sendSuccess(res, userBooking);
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
            const claim = res.locals?.claim as JwtClaimDto;
            const userId = req.query.userId as string;
            const orgId = req.query.orgId as string;
            // if (!AuthUtility.hasOrgEmpAccess(claim, orgId)) {
            //   ResponseUtility.sendFailResponse(res, null, "Unauthorized");
            //   return;
            // }
            const userBooking: UserBookingInvestigationDto =
              await this.bookingService.getPatientBooking(orgId, userId);
            ResponseUtility.sendSuccess(res, userBooking);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    this.router.get(
      `${this.path}${URL.LIST_BY_ORG}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            const claim = res.locals?.claim as JwtClaimDto;
            const orgId = req.query.orgId as string;
            const type = req.query.type as string;
            const pageNumber = Number(req.query.pageNumber as string);
            const maxRecord = Number(req.query.maxRecord as string);
            const offset = maxRecord * pageNumber - maxRecord;
            // if (!AuthUtility.hasOrgEmpAccess(claim, orgId)) {
            //   ResponseUtility.sendFailResponse(res, null, "Unauthorized");
            //   return;
            // }
            const orgBookinCount = {} as OrgBookingCountDto;
            orgBookinCount.totalBooking =
              await this.bookingService.getOrgBookingCount(orgId, type);
            orgBookinCount.orgBooking = await this.bookingService.getOrgBooking(
              orgId,
              type,
              maxRecord,
              offset
            );
            ResponseUtility.sendSuccess(res, orgBookinCount);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );
    
    // this.router.get(
    //   `${this.path}${URL.SEARCH_BOOKINGS}`,
    //   authMiddleware,
    //   (req: Request, res: Response) => {
    //     (async () => {
    //       try {
    //         const orgId = req.query.orgId as string;
    //         const query = req.query.query as string;
    //         const pageNumber = Number(req.query.pageNumber as string);
    //         const maxRecord = Number(req.query.maxRecord as string);
    //         const offset = maxRecord * pageNumber - maxRecord;
    
    //         const searchResults = await this.bookingService.searchOrgBooking(
    //           orgId,
    //           query,
    //           maxRecord,
    //           offset
    //         );
    //         ResponseUtility.sendSuccess(res, searchResults);
    //       } catch (error) {
    //         ResponseUtility.sendFailResponse(res, error);
    //       }
    //     })();
    //   }
    // );



//     this.router.get(
//       `${this.path}${URL.SEARCH_BOOKINGS}`,
//       authMiddleware,
//       async (req: Request, res: Response) => {
//         try {
//           const orgId = req.query.orgId as string;
//           const query = req.query.query as string;
//           // const pageNumber = Number(req.query.pageNumber as string);
//           // const maxRecord = Number(req.query.maxRecord as string);
//           // const offset = maxRecord * pageNumber - maxRecord;
//           const pageNumber = Number(req.query.pageNumber as string) || 1;
// const maxRecord = Number(req.query.maxRecord as string) || 10;
// const offset = maxRecord * (pageNumber - 1);

// // Ensure skip (offset) is non-negative
// const skip = Math.max(offset, 0);
    
//           const searchResults = await this.bookingService.searchOrgBooking(
//             orgId,
//             query,
//             maxRecord,
//             skip
//           );
//           console.log('Search Results:', searchResults);
//           ResponseUtility.sendSuccess(res, searchResults);
//         } catch (error) {
//           console.error('Error during searchOrgBooking:', error);
//           ResponseUtility.sendFailResponse(res, error);
//         }
//       }
//     );


// this.router.get(
//   `${this.path}${URL.SEARCH_BOOKINGS}`,
//   authMiddleware,
//   async (req: Request, res: Response) => {
//     try {
//       // const orgId = req.query.orgId as string;
//       // const query = req.query.query as string;
//       // const pageNumber = Number(req.query.pageNumber as string) || 1;
//       // const maxRecord = Number(req.query.maxRecord as string) || 10;
//       // const offset = maxRecord * (pageNumber - 1);

//       const orgId = '65682edbf126f7bf2500a5ea';
// const query = 'Aditya';
// const maxRecord = 10;
// const skip = 0;

//       // Ensure skip (offset) is non-negative
//       // const skip = Math.max(offset, 0);

//       // Validate parameters (optional but recommended)
//       if (!orgId) {
//         return ResponseUtility.sendFailResponse(res, 'Organization ID is required');
//       }

//       const searchResults = await this.bookingService.searchOrgBooking(
//         orgId,
//         query,
//         maxRecord,
//         skip
//       );

//       console.log('Search Results:', searchResults);
//       ResponseUtility.sendSuccess(res, searchResults);
//     } catch (error) {
//       console.error('Error during searchOrgBooking:', error);
//       ResponseUtility.sendFailResponse(res, error || 'Internal server error');
//     }
//   }
// );

// newly added to search from whole table end
//newly added start
// Search bookings
// this.router.get(`${this.path}/search`, async (req: Request, res: Response) => {
//   try {
//     const searchQuery = req.query.q as string;
//     const results = await bookingModel.find({ $text: { $search: searchQuery } }).exec();
//     res.status(200).json(results);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


this.router.get(`${this.path}/search`, async (req: Request, res: Response) => {
  // try {
  //   const searchQuery = req.query.q as string || '';
  //   const orgId = req.query.orgId as string; // Assuming orgId is passed as a query parameter
  //   const maxRecord = parseInt(req.query.maxRecord as string, 10) || 10;
  //   const skip = parseInt(req.query.skip as string, 10) || 0;

  //   const results = await this.bookingService.searchBooking(orgId, searchQuery, maxRecord, skip);
  //   res.status(200).json(results);
  // } catch (error) {
  //   res.status(500).json({ error: 'Internal server error' });
  // }

  try {
    const orgId = req.query.orgId as string;
    const searchQuery = req.query.q as string;
    console.log('Search Query:', searchQuery);
    console.log('Org ID:', orgId);
    const results = await this.bookingService.searchBooking(orgId, searchQuery, 10, 0);
    console.log('Results:', results);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in search API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//newly added end


    // /api/core/v1/booking/transaction-add-update
    this.router.post(
      `${this.path}${URL.TRANSACTION_ADD_UPDATE}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            const body = req.body as BookingAddTransactionDto;
            const claim = res.locals?.claim as JwtClaimDto;
            // if (
            //   res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
            //   res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
            // ) {
            //   ResponseUtility.sendFailResponse(res, null, "Not permitted");
            //   return;
            // }
            const userBooking =
              await this.bookingService.addUpdateBookingTransaction(body);
            ResponseUtility.sendSuccess(res, userBooking);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    // /api/core/v1/booking/receipt-create
    this.router.get(
      `${this.path}${URL.RECEIPT_CREATE}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            // if (
            //   res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
            //   res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
            // ) {
            //   ResponseUtility.sendFailResponse(res, null, "Not permitted");
            //   return;
            // }
            await this.pdfService.createOrderReceiptV2(req.query.bookingId as string,req.query.transactionId as string, res);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    // /api/core/v1/booking/convert-patient
    this.router.get(
      `${this.path}${URL.CONVERT_PATIENT}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            // if (
            //   res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
            //   res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
            // ) {
            //   ResponseUtility.sendFailResponse(res, null, "Not permitted");
            //   return;
            // }
            const bookingId: string = req.query.bookingId as string;
            const orgId: string = req.query.orgId as string;
            const patientType: string = req.query.patientType as string | null ?? PATIENT_TYPE.OPD;
            await this.bookingService.convertToPatient(bookingId, patientType, orgId);
            ResponseUtility.sendSuccess(res, null);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    // /api/core/v1/booking/delete
    this.router.delete(
      `${this.path}${URL.DELETE}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            const bookingId: string = req.query.bookingId as string;
            await this.bookingService.removeBookingById(req.query.bookingId as string);
            ResponseUtility.sendSuccess(res, null, "Booking deleted successfully");
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );
  }
}
export default BokingApi;
