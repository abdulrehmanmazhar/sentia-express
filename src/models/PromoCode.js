import { Schema, model } from "mongoose";


const promoSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountAmount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export default model("PromoCode", promoSchema);
