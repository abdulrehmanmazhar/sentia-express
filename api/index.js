import { loadEnvFile } from "node:process";

// ✅ Load .env only if required variables are missing
const requiredEnv = ["PORT", "MONGO_URI", "STRIPE_SECRET_KEY"];
let missingEnv = [];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    missingEnv.push(key);
  }
}

if (missingEnv.length > 0) {
  console.warn("⚠️ Missing env variables, loading from .env...");
  loadEnvFile();
  // Check again after loading .env
  missingEnv = missingEnv.filter((key) => !process.env[key]);
  if (missingEnv.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
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
