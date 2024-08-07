import { BookingVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  { 
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  //   nameF: String,
  // nameL: String,


    no: String,
    patientNo: String,

    bookingDate: mongoose.Schema.Types.Date,
    shift: String,
    timeSlot: String,

    chargable: mongoose.Schema.Types.Boolean,

    dr: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Doctor Id
    drExt: Array<String>,
    referedBy: String,
    complaint: Array<String>,
    diagnosis: Array<String>,

    type: String, // OPD, APPOINTMENT, ADMISSION, INVESTIGATION, EMERGENCY
    subType: String,
    departmentId: String,
    
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
          investigationParam: {
            specimen: String,
            params: [{
              name: String,
              gender: Array<String>,
              ageGroup: String,
              criteriaList: [{
                testName: String,
                ref: String,
                unit: String
              }]
            }]
          }
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
        sampleCollectDate: mongoose.Schema.Types.Date,
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

    observation: {
      date: mongoose.Schema.Types.Date,
      healthParams: [
        {
          key: String,
          value: String,
          name: String,
        },
      ],
    },

    test: Array<String>, // test suggested by doc

    prescription: [{
      productId: String,
      name: String, // chemical name
      dosage: String, // OD, BD, TDS, QDS
      duration: mongoose.Schema.Types.Number, // days
      instruction: String,
    }],

    instruction: Array<String>,

    nextVisitDate: mongoose.Schema.Types.Date,
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



// newly added start
//this bookingSchema.index is newly added to apply monodb search to search the any text from the bookingModel and hence show that entry in table
// Define the text index 
bookingSchema.index({

  'no': 'text',
  'patientNo': 'text',
  'shift': 'text',
  'timeSlot': 'text',
  'referedBy': 'text',
  'complaint': 'text',
  'diagnosis': 'text',
  'type': 'text',
  'subType': 'text',
  'departmentId': 'text',
  'status': 'text',
  'txStatus': 'text',
  'items.item.name': 'text',
  'items.item.code': 'text',
  'items.item.note': 'text',
  'items.note': 'text',
  'items.status': 'text',
  'items.name': 'text',
  'test': 'text',
  'prescription.name': 'text',
  'prescription.instruction': 'text',
  'instruction': 'text',
  'note': 'text',
  'observation.healthParams.key': 'text',
  'observation.healthParams.value': 'text',
  'observation.healthParams.name': 'text',
});
// newly added end

bookingSchema.virtual("patient", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

bookingSchema.virtual("drDetail", {
  ref: "User",
  localField: "dr",
  foreignField: "_id",
  justOne: true,
});

const bookingModel = mongoose.model<BookingVo & mongoose.Document>(
  "Booking",
  bookingSchema
);

export default bookingModel;
