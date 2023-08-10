import { UserService } from "../../@shared/service/user.service";
import { BOOKING_STATUS, BOOKING_TYPE, BookingVo, InvestigationVo, OrgOrderNoDto, UserBookingDto, UserBookingInvestigationDto, UserVo, BookingPopulateVo, OrgBookingDto } from "aayam-clinic-core";
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
        const newUpdatedOrderNo = await this._updateBookingStatusAndNo(booking);
        const user = await new UserService().saveBookingCust(userBookingDto.user, booking.orgId);
        userBookingDto.booking.user = user?._id ?? '';
        userBookingDto.booking = await this.bookingModel.create(booking);
        await new MetaOrgService().updateOrderNo(booking.orgId, newUpdatedOrderNo.no, newUpdatedOrderNo.patientNo, newUpdatedOrderNo.departmentNo, newUpdatedOrderNo.userTypeNo);
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

  public getOrgBooking = async (orgId: string, limit: number, offset: number): Promise<OrgBookingDto[]> => {
    const list = await this.bookingModel.find({ orgId }).limit(limit).skip(offset).populate(['patient', 'drList']) as Array<BookingPopulateVo>;
    let orgBookingList = [] as Array<OrgBookingDto>;
    if (list?.length > 0) {
      orgBookingList = list.map((it: BookingPopulateVo) => {
        const record = JSON.parse(JSON.stringify(it));
        const dto = {} as OrgBookingDto;
        dto.drList = record.drList;
        dto.patient = record.patient;
        delete record.drList;
        delete record.patient;
        dto.booking = record;
        return dto;
      });
    }
    return orgBookingList;
  };

  /* ************************************* Private Methods ******************************************** */
  private _updateBookingStatusAndNo = async (booking: BookingVo): Promise<OrgOrderNoDto> => {
    const newUpdatedOrderNo = {} as OrgOrderNoDto;
    const lastBookingOrder = await new MetaOrgService().getLastOrderNo(booking.orgId);
    booking.status = BOOKING_STATUS.PENDING;
    booking.no = String(lastBookingOrder.no + 1);
    newUpdatedOrderNo.no = lastBookingOrder.no + 1;
    if (booking.type != BOOKING_TYPE.APPOINTMENT) {
      booking.patientNo = String(lastBookingOrder.patientNo + 1);
      newUpdatedOrderNo.patientNo = lastBookingOrder.patientNo + 1;
      booking.status = BOOKING_STATUS.CONFIRMED;
    }
    return newUpdatedOrderNo;
  }
}
