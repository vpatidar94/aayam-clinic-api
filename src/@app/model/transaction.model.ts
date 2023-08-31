import {TxVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

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
    /**
     * for txType = VOID
     * amount = Sale amount
     * amountApproved = same or less approved by gateway
     *
     * for txType = RETURN
     * amount = return amount
     * amountApproved = same or less approved by gateway
     *
     * for txType = ADJUST
     * amount = Tip Amount only
     * amountApproved = Tip Amount + Sale Amount
     */
    amount: Number,
    amountApproved: Number,
    serviceCharge: Number,
    /**
     * ac = branchId-userId // composite key (branch id, user id)
     * ac = account issued by org
     */
    ac: String,
    date: Date,
    crtBy: String,
    created: Date,
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

const TransactionModel = mongoose.model<TxVo & mongoose.Document>(
  "Transactions",
  transactionSchema
);

export default TransactionModel;
