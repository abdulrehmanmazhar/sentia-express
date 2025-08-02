import { Router } from "express";
import { oauthCallback, startGoogleLogin } from "../controllers/authController.js";

const router = Router();
router.get("/oauth2callback", oauthCallback);
router.get("/startGoogleLogin", startGoogleLogin);
export default router;
