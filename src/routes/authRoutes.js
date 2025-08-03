import { Router } from "express";
import { oauthCallback, refreshAccessToken, startGoogleLogin } from "../controllers/authController.js";

const router = Router();
router.get("/oauth2callback", oauthCallback);
router.get("/startGoogleLogin", startGoogleLogin);
router.get("/refresh-token", refreshAccessToken);
export default router;
