import { loadEnvFile } from "node:process";
loadEnvFile();

const requiredEnv = ["PORT", "MONGO_URI", "STRIPE_SECRET_KEY"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}


import express from "express";
import cors from "cors";
import connectDB from "../src/config/db.js";
import authRoutes from "../src/routes/authRoutes.js";
import paymentRoutes from "../src/routes/paymentRoutes.js";


connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
