import {
  ORDER_TX_STATUS,
  OrderAddTransactionDto,
  OrgCodeNoDto,
  OrgPharmacyOrderDto,
  PharmacyOrderPopulateVo,
  PharmacyOrderVo,
  TX_STATUS,
  TxVo
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
        pharmacyOrderVo.no = newUpdatedOrderNo?.pharmacyOrderNo?.toString();
        pharmacyOrderVo.bookingDate = new Date();
        pharmacyOrderVo = await this.pharmacyOrderModel.create(pharmacyOrderVo);
        await new MetaOrgService().updateCodeNo(
          pharmacyOrderVo.orgId,
          newUpdatedOrderNo
        );
      }
      return pharmacyOrderVo;
    } catch (error) {
      throw error;
    }
  };

  public getOrgOrderCount = async (orgId: string): Promise<number> => {
    let count = 0;
    count = await this.pharmacyOrderModel.countDocuments({ orgId: orgId });
    return count;
  };

  public getOrgOrders = async (
    orgId: string,
    limit: number,
    offset: number
  ): Promise<OrgPharmacyOrderDto[]> => {
    const list = (await this.pharmacyOrderModel
      .find({ orgId })
      .limit(limit)
      .skip(offset)
      .sort({ no: "desc" })
      .collation({ locale: "en_US", numericOrdering: true })
      .populate(["patient", "drDetail"])) as Array<PharmacyOrderPopulateVo>;
    const orgBookingList = [] as Array<OrgPharmacyOrderDto>;
    if (list?.length > 0) {
      for (let i = 0; i < list.length; i++) {
        const it: PharmacyOrderPopulateVo = list[i];
        const record = JSON.parse(JSON.stringify(it));
        const dto = {} as OrgPharmacyOrderDto;
        dto.drDetail = record.drDetail;
        dto.patient = record.patient;
        delete record.drDetail;
        delete record.patient;
        dto.order = record;
        orgBookingList.push(dto);
      }
    }
    return orgBookingList;
  };

  public getOrderDetails = async (orderId: string): Promise<PharmacyOrderVo> => {
    const orderDetails = await this.pharmacyOrderModel.findOne({ _id: orderId }) as PharmacyOrderVo;
    return orderDetails;
  }

  public addUpdateBookingTransaction = async (
    orderAddTransactionDto: OrderAddTransactionDto
  ): Promise<any> => {
    try {
      const orderDetails = (await this.pharmacyOrderModel.findById(orderAddTransactionDto.orderId)) as PharmacyOrderVo;
      if (orderDetails) {
        const txList = orderDetails.tx as Array<TxVo>;
        let txVo = {} as TxVo;
        txVo.orgId = orderDetails.orgId;
        txVo.brId = orderDetails.brId;
        txVo.bookingId = orderDetails._id; //is need to change with orderId or add and addtional param for orderId
        txVo.custId = orderDetails.user;
        txVo.txType = orderAddTransactionDto.paymentMode;
        txVo.txStatus = TX_STATUS.SUCCESS;
        txVo.amount = orderAddTransactionDto.amount;
        txVo.amountApproved = orderAddTransactionDto.amount;
        txVo.serviceCharge = 0;
        txVo.date = new Date();
        txVo.created = new Date();

        txList.push(txVo);
        orderDetails.tx = txList;
        orderDetails.totalPaid = orderDetails.totalPaid + orderAddTransactionDto.amount;
        if (orderDetails.totalDue == 0 || orderDetails.totalPaid == 0) {
          orderDetails.status = ORDER_TX_STATUS.NOT_PAID;
        } else if (orderDetails.totalDue == orderDetails.totalPaid) {
          orderDetails.status = ORDER_TX_STATUS.PAID;
        } else if (orderDetails.totalDue > orderDetails.totalPaid) {
          orderDetails.status = ORDER_TX_STATUS.PARTIALLY_PAID;
        } else if (orderDetails.totalDue < orderDetails.totalPaid) {
          orderDetails.status = ORDER_TX_STATUS.ADVANCE_PAID;
        }
        const booking = (await pharmacyOrderModel.findByIdAndUpdate(
          orderDetails._id,
          orderDetails,
          { new: true }
        )) as PharmacyOrderVo;
        await this.transactionModel.create(txVo);
        return booking;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };

  public pharmacyIdByBookingId = async (bookingId: string): Promise<string | null> => {
    let pharmacyOrderId = null;
    const order: PharmacyOrderVo | null = await this.pharmacyOrderModel.findOne({ bookingId });
    if (order && order._id) {
      pharmacyOrderId = order._id.toString();
    }
    return pharmacyOrderId;
  };

  /* ************************************* Private Methods ******************************************** */
  private _updatePharmacyOrderStatusAndNo = async (
    pharmacyOrder: PharmacyOrderVo
  ): Promise<OrgCodeNoDto> => {
    const newUpdatedOrderNo = {} as OrgCodeNoDto;
    const lastBookingOrder = await new MetaOrgService().getLastCodeNo(
      pharmacyOrder.orgId
    );
    newUpdatedOrderNo.pharmacyOrderNo = lastBookingOrder.pharmacyOrderNo + 1;
    return newUpdatedOrderNo;
  };
}
