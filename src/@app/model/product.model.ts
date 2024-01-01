import { ProductVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  brId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
  name: String,
  code: String,
  drug: String,
  productType: String,
  company: String,
  packagingType: String,
  qtyPerPackage: Number,
  price : Number,
  pricePerPackage : Number,
  purchaseDate: mongoose.Schema.Types.Date,
  expirtyDate : mongoose.Schema.Types.Date,

  status: String,
  del: mongoose.Schema.Types.Boolean,
  modBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  crtBy:  {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modified: mongoose.Schema.Types.Date,
  created: mongoose.Schema.Types.Date,
}, {
  toJSON: {
    getters: true,
    setters: true
  },
  toObject: {
    getters: true,
    setters: true
  }
});

const productModel = mongoose.model<ProductVo & mongoose.Document>("product", productSchema);

export default productModel;
