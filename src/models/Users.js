import { Schema, model } from "mongoose";


const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  paymentDone: { type: Boolean, default: false },
  tokens: { type: Object },
});

export default model("User", userSchema);
