import fetch from "node-fetch";
import User from "../models/Users.js";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FRONTEND_REDIRECT_URL,
} = process.env;

export const oauthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send("Missing code");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoRes.json();

    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      user = new User({
        email: userInfo.email,
        name: userInfo.name,
        tokens,
      });
      await user.save();
    } else {
      user.tokens = tokens;
      await user.save();
    }

    if (!user.paymentDone) {
      return res.redirect(`/pay?email=${userInfo.email}`);
    }

    return res.redirect(
      `${FRONTEND_REDIRECT_URL}?tokens=${encodeURIComponent(JSON.stringify(tokens))}`
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth failed");
  }
};
