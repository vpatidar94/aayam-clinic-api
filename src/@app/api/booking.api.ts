import { BookingService } from '@app/service/booking.service';
import { JwtClaimDto, UserBookingDto, UserBookingInvestigationDto } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { URL } from '../../@shared/const/url';
import { Route } from '../../@shared/interface/route.interface';
import authMiddleware from '../../@shared/middleware/auth.middleware';
import { AuthUtility } from '../../@shared/utility/auth.utility';
import { ResponseUtility } from '../../@shared/utility/response.utility';

class BokingApi implements Route {
    public path = URL.MJR_BOOKING;
    public router = Router();

    private bookingService = new BookingService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // /api/core/v1/booking/app-update
        this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
            (
                async () => {
                    try {
                        const body = req.body as UserBookingDto;
                        const claim = res.locals?.claim as JwtClaimDto;
                        if (!AuthUtility.hasOrgEmpAccess(claim, body?.booking?.orgId)) {
                            ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                            return;
                        }
                        const userBooking = await this.bookingService.addUpdateBooking(body);
                        ResponseUtility.sendSuccess(res, userBooking);
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
                    const claim = res.locals?.claim as JwtClaimDto;
                    const userId = req.query.usserId as string;
                    const orgId = req.query.orgId as string;
                    if (!AuthUtility.hasOrgEmpAccess(claim, orgId)) {
                        ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                        return;
                    }
                    const userBooking: UserBookingInvestigationDto = await this.bookingService.getPatientBooking(orgId, userId);
                    ResponseUtility.sendSuccess(res, userBooking);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });
    }
}
export default BokingApi;
