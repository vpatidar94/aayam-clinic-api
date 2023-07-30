import { UserService } from "@shared/service/user.service";
import { BOOKING_STATUS, BOOKING_TYPE, BookingVo, InvestigationVo, UserBookingDto, UserBookingInvestigationDto, UserVo } from "aayam-clinic-core";
import bookingModel from "../../@app/model/booking.model";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { InvestigationService } from "./investigation.service";

export class BookingService {
  public bookingModel = bookingModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateBooking = async (userBookingDto: UserBookingDto): Promise<UserBookingDto | null> => {
    try {
      const booking = userBookingDto.booking;
      if (booking._id) {
        userBookingDto.booking = await bookingModel.findByIdAndUpdate(booking._id, booking, { new: true }) as BookingVo;
      } else {
        await this._updateBookingStatusAndNo(booking);
        userBookingDto.booking = await this.bookingModel.create(booking);
      }
      return userBookingDto;
    } catch (error) {
      throw error;
    }
  };

  public getPatientBooking = async (orgId: string, userId: string): Promise<UserBookingInvestigationDto> => {
    const userBookingInvestigationDto = {} as UserBookingInvestigationDto;
    userBookingInvestigationDto.bookingList = await this.bookingModel.find({ user: userId, orgId: orgId }) as Array<BookingVo>;
    userBookingInvestigationDto.investigation = await new InvestigationService().getUserInvestigation(userId) ?? [] as Array<InvestigationVo>;
    userBookingInvestigationDto.user = await new UserService().getUserById(userId) ?? {} as UserVo;
    return userBookingInvestigationDto;
  };

  /* ************************************* Private Methods ******************************************** */
  private _updateBookingStatusAndNo = async (booking: BookingVo): Promise<void> => {
    const lastBookingOrder = await new MetaOrgService().getLastOrderNo(booking.orgId);
    booking.status = BOOKING_STATUS.PENDING;
    booking.no = String(lastBookingOrder.no + 1);
    if (booking.type != BOOKING_TYPE.APPOINTMENT) {
      booking.patientNo = String(lastBookingOrder.patientNo + 1);
      booking.status = BOOKING_STATUS.CONFIRMED;
    }
  }
}
