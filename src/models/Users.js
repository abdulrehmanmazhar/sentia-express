import { Schema, model } from "mongoose";

const paymentDetailsSchema = new Schema({
  amount_paid: { type: Number, default: 0 },
  currency: { type: String, default: "usd" },
  promo_code: { type: String, default: null },
  stripeSessionId: { type: String, default: null }
}, { _id: false });

const tokenSchema = new Schema({
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number,
  id_token: String
}, { _id: false });

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  paymentDone: { type: Boolean, default: false },
  paymentDetails: { type: paymentDetailsSchema, default: {} },
  tokens: { type: tokenSchema, default: {} }
}, { timestamps: true });

export default model("User", userSchema);
