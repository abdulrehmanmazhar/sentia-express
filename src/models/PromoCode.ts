import { Schema, model } from "mongoose";

interface IPromoCode {
  code: string;
  discountAmount: number;
  active: boolean;
}

const promoSchema = new Schema<IPromoCode>({
  code: { type: String, required: true, unique: true },
  discountAmount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export default model<IPromoCode>("PromoCode", promoSchema);
