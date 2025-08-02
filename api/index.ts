import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });


import express from "express";
import cors from "cors";
import connectDB from "../src/config/db";
import authRoutes from "../src/routes/authRoutes";
import paymentRoutes from "../src/routes/paymentRoutes";


connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
