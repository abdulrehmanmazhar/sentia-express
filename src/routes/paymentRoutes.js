import express, { Router } from "express";
import { createCheckoutSession, handleWebhook } from "../controllers/paymentController.js";

const router = Router();
router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook",express.raw({ type: 'application/json' }), handleWebhook);
export default router;
