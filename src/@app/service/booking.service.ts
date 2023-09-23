import { UserService } from "../../@shared/service/user.service";
import {
  BOOKING_STATUS,
  BOOKING_TYPE,
  BookingVo,
  InvestigationVo,
  OrgOrderNoDto,
  UserBookingDto,
  UserBookingInvestigationDto,
  UserVo,
  BookingPopulateVo,
  OrgBookingDto,
  BookingAddTransactionDto,
  TxVo,
  TX_STATUS,
  ORDER_STATUS,
} from "aayam-clinic-core";
import bookingModel from "../../@app/model/booking.model";
import TransactionModel from "../../@app/model/transaction.model";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { InvestigationService } from "./investigation.service";

export class BookingService {
  public bookingModel = bookingModel;
  public transactionModel = TransactionModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateBooking = async (
    userBookingDto: UserBookingDto
  ): Promise<UserBookingDto | null> => {
    try {
      const booking = userBookingDto.booking;
      if (booking._id) {
        userBookingDto.booking = (await bookingModel.findByIdAndUpdate(
          booking._id,
          booking,
          { new: true }
        )) as BookingVo;
      } else {
        const newUpdatedOrderNo = await this._updateBookingStatusAndNo(booking);
        const user = await new UserService().saveBookingCust(
          userBookingDto.user,
          booking.orgId
        );
        userBookingDto.booking.user = user?._id ?? "";
        userBookingDto.booking = await this.bookingModel.create(booking);
        await new MetaOrgService().updateOrderNo(
          booking.orgId,
          newUpdatedOrderNo
        );
      }
      return userBookingDto;
    } catch (error) {
      throw error;
    }
  };

  public getPatientBooking = async (
    orgId: string,
    userId: string
  ): Promise<UserBookingInvestigationDto> => {
    const userBookingInvestigationDto = {} as UserBookingInvestigationDto;
    userBookingInvestigationDto.bookingList = (await this.bookingModel.find({
      user: userId,
      orgId: orgId,
    })) as Array<BookingVo>;
    userBookingInvestigationDto.investigation =
      (await new InvestigationService().getUserInvestigation(userId)) ??
      ([] as Array<InvestigationVo>);
    userBookingInvestigationDto.user =
      (await new UserService().getUserById(userId)) ?? ({} as UserVo);
    return userBookingInvestigationDto;
  };

  public getOrgBooking = async (
    orgId: string,
    type: string,
    limit: number,
    offset: number
  ): Promise<OrgBookingDto[]> => {
    const list = (await this.bookingModel
      .find({ orgId, type })
      .limit(limit)
      .skip(offset)
      .sort({ no: "desc" })
      .collation({ locale: "en_US", numericOrdering: true })
      .populate(["patient", "drList"])) as Array<BookingPopulateVo>;
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

  public getBookingDetails = async (bookingId: string): Promise<BookingVo> => {
    const bookingDetails = await this.bookingModel.findOne({ _id: bookingId }) as BookingVo;
    return bookingDetails;
  }

  public getOrgBookingCount = async (orgId: string, type: string): Promise<number> => {
    let count = 0;
    count = await this.bookingModel.countDocuments({ orgId: orgId, type: type });
    return count;
  };

  public addUpdateBookingTransaction = async (
    bookingAddTransactionDto: BookingAddTransactionDto
  ): Promise<any> => {
    try {
      const bookingDetails = (await this.bookingModel.findById(bookingAddTransactionDto.bookingId)) as BookingVo;
      if (bookingDetails) {
        const txList = bookingDetails.tx as Array<TxVo>;
        let txVo = {} as TxVo;
        txVo.orgId = bookingDetails.orgId;
        txVo.brId = bookingDetails.brId;
        txVo.bookingId = bookingDetails._id;
        txVo.custId = bookingDetails.user;
        txVo.txType = bookingAddTransactionDto.paymentMode;
        txVo.txStatus = TX_STATUS.SUCCESS;
        txVo.amount = bookingAddTransactionDto.amount;
        txVo.amountApproved = bookingAddTransactionDto.amount;
        txVo.serviceCharge = 0;
        txVo.date = new Date();
        txVo.created = new Date();

        txList.push(txVo);
        bookingDetails.tx = txList;
        bookingDetails.totalPaid = bookingDetails.totalPaid + bookingAddTransactionDto.amount;
        if(bookingDetails.totalDue == 0 || bookingDetails.totalPaid == 0){
          bookingDetails.status = ORDER_STATUS.NOT_PAID;
        }else if (bookingDetails.totalDue == bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_STATUS.PAID;
        } else if (bookingDetails.totalDue > bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_STATUS.PARTIALLY_PAID;
        } else if (bookingDetails.totalDue < bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_STATUS.ADVANCE_PAID;
        }
        const booking = (await bookingModel.findByIdAndUpdate(
          bookingDetails._id,
          bookingDetails,
          { new: true }
        )) as BookingVo;
        await this.transactionModel.create(txVo);
        return booking;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };

  /* ************************************* Private Methods ******************************************** */
  private _updateBookingStatusAndNo = async (
    booking: BookingVo
  ): Promise<OrgOrderNoDto> => {
    const newUpdatedOrderNo = {} as OrgOrderNoDto;
    const lastBookingOrder = await new MetaOrgService().getLastOrderNo(
      booking.orgId
    );
    booking.status = BOOKING_STATUS.PENDING;
    booking.no = String(lastBookingOrder.no + 1);
    newUpdatedOrderNo.no = lastBookingOrder.no + 1;
    //@todo frontend will send BOOKING_TYPE PATIENT ALSO
    if (booking.type != BOOKING_TYPE.APPOINTMENT) {
      booking.patientNo = String(lastBookingOrder.patientNo + 1);
      newUpdatedOrderNo.patientNo = lastBookingOrder.patientNo + 1;
      booking.status = BOOKING_STATUS.CONFIRMED;
    }
    return newUpdatedOrderNo;
  };
}
