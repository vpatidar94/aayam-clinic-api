import { PharmacyOrderVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const pharmacyOrderSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    no: String,
    bookingDate: Date,

    status: String, // OrderStatus - [HOLD, WIP, DELETE]
    txStatus: String, // OrderStatusTx - [UNPAID, PAID, PAID_PARTLY, VOID]
    items: [
      {
        item: {
          _id: { type: mongoose.Schema.Types.ObjectId, ref: "serviceItem" },
          orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
          brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
          departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
          },
          serviceTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "serviceType",
          },
          associatedDoctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
          name: String,
          code: String,
          fee: Number,
          feeType: {
            isPercent: mongoose.Schema.Types.Boolean,
            value: { type: Number }
          },
          doctorFee: Number,
          orgFee: Number,
          status: String,
          del: mongoose.Schema.Types.Boolean,
          modBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          crtBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          modified: mongoose.Schema.Types.Date,
          created: mongoose.Schema.Types.Date,
        },
        qty: mongoose.Schema.Types.Number, // Quantity

        note: String, //Special instructions, Extra instructions - List any special requests

        status: String, // OrderItemStatus - REFUND

        taxInclusive: mongoose.Schema.Types.Boolean, // from ItemVo.taxInclusive
        priceBase: mongoose.Schema.Types.Number, // from ItemVo.price

        tax: mongoose.Schema.Types.Number, // total tax
        amount: mongoose.Schema.Types.Number, // Amount = qty * price

        // Tax / GST
        igst: mongoose.Schema.Types.Number,
        cgst: mongoose.Schema.Types.Number,
        sgst: mongoose.Schema.Types.Number,

        openItem: mongoose.Schema.Types.Boolean,
        name: String,
      },
    ],
    tx: [
      // please refer to tx.vo
      {
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
        brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
        deviceId: String,
        registerId: String,
        custId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        note: String,
        orderId: String,
        txTenderType: String,
        txType: String,
        txOrigin: String,
        txProcessor: String,
        txStatus: String,
        gatewayResId: String,
        gatewayRes: mongoose.Schema.Types.Mixed,
        authCode: String,
        cardType: String,
        last4: String,
        refNum: String,
        resultCode: String,
        signData: String,
        cardHolderName: String,
        amount: Number,
        amountApproved: Number,
        serviceCharge: Number,
        ac: String,
        date: Date,
        crtBy: String,
        created: Date,
      },
    ],
    txDateLast: mongoose.Schema.Types.Date, // used in report - Date of the last successful transaction - order date

    // GST
    igst: mongoose.Schema.Types.Number,
    cgst: mongoose.Schema.Types.Number,
    sgst: mongoose.Schema.Types.Number,

    subTotal: mongoose.Schema.Types.Number,
    tax: mongoose.Schema.Types.Number, // total tax
    discount: mongoose.Schema.Types.Number, // discount to the order -OR- CreditMemo Amount
    deliveryFee: mongoose.Schema.Types.Number, // delivery fee
    serviceFee: mongoose.Schema.Types.Number, // service charge / service fee
    discountCash: mongoose.Schema.Types.Number, // ?
    totalDue: mongoose.Schema.Types.Number,
    totalPaid: {type : Number , default : 0},

    crtBy: String,
    created: mongoose.Schema.Types.Date,
    modified: mongoose.Schema.Types.Date,

    note: String,
    prescription: [{
      productId: String,
      name: String, // chemical name
      dosage: String, // OD, BD, TDS, QDS
      duration: mongoose.Schema.Types.Number, // days
      instruction: String,
    }],
  },
  {
    toJSON: {
      getters: true,
      setters: true,
    },
    toObject: {
      getters: true,
      setters: true,
    },
  }
);

pharmacyOrderSchema.virtual("patient", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

pharmacyOrderSchema.virtual("drDetail", {
  ref: "User",
  localField: "dr",
  foreignField: "_id",
  justOne: true,
});

const pharmacyOrdersModel = mongoose.model<PharmacyOrderVo & mongoose.Document>(
  "pharmacyOrders",
  pharmacyOrderSchema
);

export default pharmacyOrdersModel;
