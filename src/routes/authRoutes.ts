import { Router } from "express";
import { oauthCallback } from "../controllers/authController";

const router = Router();
router.get("/oauth2callback", oauthCallback);
export default router;
