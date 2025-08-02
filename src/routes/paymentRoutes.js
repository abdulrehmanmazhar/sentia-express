import { Router } from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/paymentController.js";

const router = Router();
router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook", handleWebhook);
export default router;
