import { loadEnvFile } from "node:process";

const MODE = process.env.MODE || "dev";

if (MODE === "dev") {
  await loadEnvFile();
  console.log("✅ Loaded .env file for development");
}

const requiredEnv = ["MONGO_URI", "STRIPE_SECRET_KEY"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
}

// ✅ Dynamic imports to respect env loading
const express = (await import("express")).default;
const cors = (await import("cors")).default;
const { default: connectDB } = await import("../src/config/db.js");
const { default: authRoutes } = await import("../src/routes/authRoutes.js");
const { default: paymentRoutes } = await import("../src/routes/paymentRoutes.js");

await connectDB();

const app = express();
app.use(cors());
app.post("/api/payment/webhook", express.raw({ type: 'application/json' }), (await import("../src/controllers/paymentController.js")).handleWebhook);
app.use(express.json());
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
