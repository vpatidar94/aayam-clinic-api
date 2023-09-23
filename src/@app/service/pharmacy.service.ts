import {
  OrgOrderNoDto,
  PharmacyOrderVo,
} from "aayam-clinic-core";
import pharmacyOrderModel from "../../@app/model/pharmacy-order.model";
import TransactionModel from "../../@app/model/transaction.model";
import { MetaOrgService } from "../../@shared/service/meta-org.service";

export class PharmacyService {
  public pharmacyOrderModel = pharmacyOrderModel;
  public transactionModel = TransactionModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateOrder = async (
    pharmacyOrderVo: PharmacyOrderVo
  ): Promise<PharmacyOrderVo | null> => {
    try {

      if (pharmacyOrderVo._id) {
        pharmacyOrderVo = (await pharmacyOrderModel.findByIdAndUpdate(
            pharmacyOrderVo._id,
            pharmacyOrderVo,
          { new: true }
        )) as PharmacyOrderVo;
      } else {
        const newUpdatedOrderNo = await this._updatePharmacyOrderStatusAndNo(pharmacyOrderVo);

        pharmacyOrderVo = await this.pharmacyOrderModel.create(pharmacyOrderVo);
        await new MetaOrgService().updateOrderNo(
          pharmacyOrderVo.orgId,
          newUpdatedOrderNo
        );
      }
      return pharmacyOrderVo;
    } catch (error) {
      throw error;
    }
  };

//   public getPatientBooking = async (
//     orgId: string,
//     userId: string
//   ): Promise<UserBookingInvestigationDto> => {
//     const userBookingInvestigationDto = {} as UserBookingInvestigationDto;
//     userBookingInvestigationDto.bookingList = (await this.bookingModel.find({
//       user: userId,
//       orgId: orgId,
//     })) as Array<BookingVo>;
//     userBookingInvestigationDto.investigation =
//       (await new InvestigationService().getUserInvestigation(userId)) ??
//       ([] as Array<InvestigationVo>);
//     userBookingInvestigationDto.user =
//       (await new UserService().getUserById(userId)) ?? ({} as UserVo);
//     return userBookingInvestigationDto;
//   };

  //   public getOrgBooking = async (
  //     orgId: string,
  //     type: string,
  //     limit: number,
  //     offset: number
  //   ): Promise<OrgBookingDto[]> => {
  //     const list = (await this.bookingModel
  //       .find({ orgId, type })
  //       .limit(limit)
  //       .skip(offset)
  //       .sort({ no: "desc" })
  //       .collation({ locale: "en_US", numericOrdering: true })
  //       .populate(["patient", "drList"])) as Array<BookingPopulateVo>;
  //     let orgBookingList = [] as Array<OrgBookingDto>;
  //     if (list?.length > 0) {
  //       orgBookingList = list.map((it: BookingPopulateVo) => {
  //         const record = JSON.parse(JSON.stringify(it));
  //         const dto = {} as OrgBookingDto;
  //         dto.drList = record.drList;
  //         dto.patient = record.patient;
  //         delete record.drList;
  //         delete record.patient;
  //         dto.booking = record;
  //         return dto;
  //       });
  //     }
  //     return orgBookingList;
  //   };

  //   public getBookingDetails = async (bookingId: string): Promise<BookingVo> => {
  //     const bookingDetails = await this.bookingModel.findOne({ _id: bookingId }) as BookingVo;
  //     return bookingDetails;
  //   }

  //   public getOrgBookingCount = async (orgId: string, type: string): Promise<number> => {
  //     let count = 0;
  //     count = await this.bookingModel.countDocuments({ orgId: orgId, type: type });
  //     return count;
  //   };

  //   public addUpdateBookingTransaction = async (
  //     bookingAddTransactionDto: BookingAddTransactionDto
  //   ): Promise<any> => {
  //     try {
  //       const bookingDetails = (await this.bookingModel.findById(bookingAddTransactionDto.bookingId)) as BookingVo;
  //       if (bookingDetails) {
  //         const txList = bookingDetails.tx as Array<TxVo>;
  //         let txVo = {} as TxVo;
  //         txVo.orgId = bookingDetails.orgId;
  //         txVo.brId = bookingDetails.brId;
  //         txVo.bookingId = bookingDetails._id;
  //         txVo.custId = bookingDetails.user;
  //         txVo.txType = bookingAddTransactionDto.paymentMode;
  //         txVo.txStatus = TX_STATUS.SUCCESS;
  //         txVo.amount = bookingAddTransactionDto.amount;
  //         txVo.amountApproved = bookingAddTransactionDto.amount;
  //         txVo.serviceCharge = 0;
  //         txVo.date = new Date();
  //         txVo.created = new Date();

  //         txList.push(txVo);
  //         bookingDetails.tx = txList;
  //         bookingDetails.totalPaid = bookingDetails.totalPaid + bookingAddTransactionDto.amount;
  //         if(bookingDetails.totalDue == 0 || bookingDetails.totalPaid == 0){
  //           bookingDetails.status = ORDER_STATUS.NOT_PAID;
  //         }else if (bookingDetails.totalDue == bookingDetails.totalPaid) {
  //           bookingDetails.status = ORDER_STATUS.PAID;
  //         } else if (bookingDetails.totalDue > bookingDetails.totalPaid) {
  //           bookingDetails.status = ORDER_STATUS.PARTIALLY_PAID;
  //         } else if (bookingDetails.totalDue < bookingDetails.totalPaid) {
  //           bookingDetails.status = ORDER_STATUS.ADVANCE_PAID;
  //         }
  //         const booking = (await bookingModel.findByIdAndUpdate(
  //           bookingDetails._id,
  //           bookingDetails,
  //           { new: true }
  //         )) as BookingVo;
  //         await this.transactionModel.create(txVo);
  //         return booking;
  //       }
  //       return null;
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  /* ************************************* Private Methods ******************************************** */
    private _updatePharmacyOrderStatusAndNo = async (
      pharmacyOrder: PharmacyOrderVo
    ): Promise<OrgOrderNoDto> => {
      const newUpdatedOrderNo = {} as OrgOrderNoDto;
      const lastBookingOrder = await new MetaOrgService().getLastOrderNo(
        pharmacyOrder.orgId
      );
      newUpdatedOrderNo.pharmacyOrderNo = lastBookingOrder.pharmacyOrderNo + 1;
      return newUpdatedOrderNo;
    };
}
