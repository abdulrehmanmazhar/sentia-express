import { Router } from "express";
import { oauthCallback, refreshAccessToken, startGoogleLogin } from "../controllers/authController.js";

const router = Router();
router.get("/oauth2callback", oauthCallback);
router.get("/startGoogleLogin", startGoogleLogin);
router.post("/refresh-token", refreshAccessToken);
export default router;
