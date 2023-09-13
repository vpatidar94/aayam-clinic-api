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
} from "aayam-clinic-core";
import bookingModel from "../../@app/model/booking.model";
import TransactionModel from "../../@app/model/transaction.model";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { InvestigationService } from "./investigation.service";

export class BookingService {
  public bookingModel = bookingModel;
  public TransactionModel = TransactionModel;

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
    limit: number,
    offset: number
  ): Promise<OrgBookingDto[]> => {
    const list = (await this.bookingModel
      .find({ orgId })
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

  public getBookingDetails = async(bookingId:string): Promise<BookingVo> => {
    const bookingDetails = await this.bookingModel.findOne({ _id : bookingId }) as BookingVo;
    return bookingDetails;
  }

  public getOrgBookingCount = async (orgId: string): Promise<number> => {
    let count = 0;
    count = await this.bookingModel.countDocuments({ orgId: orgId });
    return count;
  };

  public addUpdateBookingTransaction = async (
    BookingAddTransactionDto: BookingAddTransactionDto
  ): Promise<any> => {
    try {
      const bookingDetails = (await this.bookingModel.findOne({
        _id: BookingAddTransactionDto.bookingId,
      })) as BookingVo;
      if (bookingDetails) {
        const txVoArray = bookingDetails.tx as Array<TxVo>;
          let txVo = {
            id : "",
            orgId: bookingDetails.orgId,
            brId: bookingDetails.brId,
            bookingId: bookingDetails._id,
            deviceId: "",
            registerId: "",
            custId: bookingDetails.user,
            note: "",
            orderId: "",
            txTenderType: "",
            txType: BookingAddTransactionDto.paymentMode,
            txOrigin: "",
            txProcessor: "",
            txStatus: "success",
            gatewayResId: "",
            gatewayRes: "",
            authCode: "",
            cardType: "",
            last4: "",
            refNum: "",
            resultCode: "200",
            signData: "",
            cardHolderName: "",
            amount: BookingAddTransactionDto.amount,
            amountApproved: BookingAddTransactionDto.amount,
            serviceCharge: 0,
            ac: "",
            date: new Date(),
            crtBy: "",
            created: new Date(),
          };
          txVoArray.push(txVo);
          bookingDetails.tx = txVoArray;
          bookingDetails.totalPaid = bookingDetails.totalPaid + BookingAddTransactionDto.amount;
          if(bookingDetails.totalDue == bookingDetails.totalPaid){
            bookingDetails.status = "PAID";
          }else if(bookingDetails.totalDue > bookingDetails.totalPaid){
            bookingDetails.status = "PARTIALLY_PAID";
          }else{
            bookingDetails.status = "ADVANCE_PAID";
          }
          const booking = (await bookingModel.findByIdAndUpdate(
            bookingDetails._id,
            bookingDetails,
            { new: true }
          )) as BookingVo;
          await this.TransactionModel.create(txVo as TxVo);
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
    if (booking.type != BOOKING_TYPE.APPOINTMENT) {
      booking.patientNo = String(lastBookingOrder.patientNo + 1);
      newUpdatedOrderNo.patientNo = lastBookingOrder.patientNo + 1;
      booking.status = BOOKING_STATUS.CONFIRMED;
    }
    return newUpdatedOrderNo;
  };
}
