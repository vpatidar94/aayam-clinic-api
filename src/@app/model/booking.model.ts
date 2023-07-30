import { BookingVo } from 'aayam-clinic-core';
import * as mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  no: String,
  patientNo: String,

  bookingDate: mongoose.Schema.Types.Date,
  timeSlot: String,

  chargable: mongoose.Schema.Types.Boolean,

  dr: Array<String>, // Doctor Id
  drExt: Array<String>,
  referedBy: String,
  complaint: Array<String>,
  diagnosis: Array<String>,

  type: String, // OPD, APPOINTMENT, ADMISSION, INVESTIGATION, EMERGENCY


  status: String, // OrderStatus - [HOLD, WIP, DELETE]
  txStatus: String, // OrderStatusTx - [UNPAID, PAID, PAID_PARTLY, VOID]
  items: [
    {
      item: {
        orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
        brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
        name: String,
        description: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        price: { type: Number }, // Price in lowest unit
        taxInclusive: Boolean,
        igst: Number,
        cgst: Number,
        sgst: Number,
        active: Boolean,
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
    }
  ],
  tx: mongoose.Schema.Types.Array,
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

  crtBy: String,
  created: mongoose.Schema.Types.Date,
  modified: mongoose.Schema.Types.Date,

  note: String,

  observation: {
    date: mongoose.Schema.Types.Date,
    observation: [
      {
        key: String,
        value: String,
        name: String,
      }
    ]
  },

  test: Array<String>, // test suggested by doc

  prescription: {
    name: String,// chemical name
    dosage: String,// OD, BD, TDS, QDS
    duration: mongoose.Schema.Types.Number, // days
    instruction: String,
  },

  instruction: Array<String>,

  nextVisitDate: mongoose.Schema.Types.Date,
});

const bookingModel = mongoose.model<BookingVo & mongoose.Document>('Booking', bookingSchema);

export default bookingModel;
