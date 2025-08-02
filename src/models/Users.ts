import { Schema, model } from "mongoose";

interface IUser {
  email: string;
  name: string;
  paymentDone: boolean;
  tokens?: any;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  paymentDone: { type: Boolean, default: false },
  tokens: { type: Object },
});

export default model<IUser>("User", userSchema);
