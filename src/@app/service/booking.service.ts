import {
  BOOKING_STATUS,
  BOOKING_TYPE,
  BookingAddTransactionDto,
  BookingPopulateVo,
  BookingVo,
  InvestigationVo,
  ORDER_TX_STATUS,
  OrgBookingDto,
  OrgCodeNoDto,
  TX_STATUS,
  TxVo,
  UserBookingDto,
  UserBookingInvestigationDto,
  UserVo
} from "aayam-clinic-core";
import bookingModel from "../../@app/model/booking.model";
import TransactionModel from "../../@app/model/transaction.model";
import { APP_CONST } from "../../@shared/const/app.const";
import departmentModel from "../../@shared/model/department.model";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { UserService } from "../../@shared/service/user.service";
import { InvestigationService } from "./investigation.service";
import { PharmacyService } from "./pharmacy.service";
import { SmsService } from "../../@shared/service/sms.service";
import { OrgService } from "../../@shared/service/org.service";

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
        await new MetaOrgService().updateCodeNo(
          booking.orgId,
          newUpdatedOrderNo
        );
        await SmsService.sendAppointmentConfirmation(userBookingDto.user.cell, userBookingDto.booking.bookingDate?.toDateString(), userBookingDto.booking.timeSlot);
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
      .populate(["patient", "drDetail"])) as Array<BookingPopulateVo>;
    const orgBookingList = [] as Array<OrgBookingDto>;
    if (list?.length > 0) {
      for (let i = 0; i < list.length; i++) {
        const it: BookingPopulateVo = list[i];
        const record = JSON.parse(JSON.stringify(it));
        const dto = {} as OrgBookingDto;
        dto.drDetail = record.drDetail;
        dto.patient = record.patient;
        dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
        delete record.drDetail;
        delete record.patient;
        dto.booking = record;
        orgBookingList.push(dto);
      }
    }
    return orgBookingList;
  };

  public getInvestigationPatient = async (
    orgId: string,
  ): Promise<OrgBookingDto[]> => {
    const dept = await departmentModel.findOne({ name: APP_CONST.PATHOLOGY, orgId });
    const list = (await this.bookingModel
      .find({ orgId, departmentId: dept?._id?.toString() })
      .sort({ no: "desc" })
      .collation({ locale: "en_US", numericOrdering: true })
      .populate(["patient", "drDetail"])) as Array<BookingPopulateVo>;
    let investigationPatientList = [] as Array<OrgBookingDto>;
    if (list?.length > 0) {
      investigationPatientList = list.map((it: BookingPopulateVo) => {
        const record = JSON.parse(JSON.stringify(it));
        const dto = {} as OrgBookingDto;
        dto.drDetail = record.drDetail;
        dto.patient = record.patient;
        delete record.drDetail;
        delete record.patient;
        dto.booking = record;
        return dto;
      });
    }
    return investigationPatientList;
  };

  public getBookingAndUserDetails = async (bookingId: string): Promise<BookingPopulateVo> => {
    const bookingDetails = await this.bookingModel.findOne({ _id: bookingId }).populate(["patient"]) as BookingPopulateVo;
    return bookingDetails;
  }

  public getBookingDetails = async (bookingId: string): Promise<BookingVo> => {
    const bookingDetails = await this.bookingModel.findOne({ _id: bookingId }) as BookingVo;
    return bookingDetails;
  }

  public removeBookingById = async (bookingId: string): Promise<boolean> => {
    await this.bookingModel.findByIdAndDelete({ _id: bookingId });
    return true;
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
        if (bookingDetails.totalDue == 0 || bookingDetails.totalPaid == 0) {
          bookingDetails.status = ORDER_TX_STATUS.NOT_PAID;
        } else if (bookingDetails.totalDue == bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_TX_STATUS.PAID;
        } else if (bookingDetails.totalDue > bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_TX_STATUS.PARTIALLY_PAID;
        } else if (bookingDetails.totalDue < bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_TX_STATUS.ADVANCE_PAID;
        }
        const booking = (await bookingModel.findByIdAndUpdate(
          bookingDetails._id,
          bookingDetails,
          { new: true }
        )) as BookingVo;
        await this.transactionModel.create(txVo);
        const bookingDetail: BookingPopulateVo = await this.getBookingAndUserDetails(bookingAddTransactionDto.bookingId);
        const org = await new OrgService().getOrgById(bookingDetail.orgId);
        await SmsService.sendThanksMsg(bookingDetail.patient?.cell, org?.ph ?? '');
        return booking;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };

  public convertToPatient = async (bookingId: string, patientType: string, orgId: string): Promise<void> => {
    const lastBookingOrder = await new MetaOrgService().getLastCodeNo(orgId);
    const fields = {
      patientNo: String(lastBookingOrder.patientNo + 1),
      status: BOOKING_STATUS.CONFIRMED,
      type: BOOKING_TYPE.PATIENT,
      subType: patientType
    } as any;
    await this.bookingModel.findByIdAndUpdate(bookingId, { $set: fields }, { new: true });
  }

  /* ************************************* Private Methods ******************************************** */
  private _updateBookingStatusAndNo = async (
    booking: BookingVo
  ): Promise<OrgCodeNoDto> => {
    const newUpdatedOrderNo = {} as OrgCodeNoDto;
    const lastBookingOrder = await new MetaOrgService().getLastCodeNo(
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
