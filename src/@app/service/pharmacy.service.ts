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

    public getOrgOrders = async (
      orgId: string,
      limit: number,
      offset: number
    ): Promise<PharmacyOrderVo[]> => {
      const list = (await this.pharmacyOrderModel
        .find({ orgId })
        .limit(limit)
        .skip(offset)
        .sort({ no: "desc" })) as Array<PharmacyOrderVo>;
      return list;
    };

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
