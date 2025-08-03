import fetch from "node-fetch";
import User from "../models/Users.js";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FRONTEND_REDIRECT_URL,
} = process.env;

// export const oauthCallback = async (req, res) => {
//   try {
//     const { code } = req.query;
//     if (!code) return res.status(400).send("Missing code");

//     const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         client_id: GOOGLE_CLIENT_ID,
//         client_secret: GOOGLE_CLIENT_SECRET,
//         code: code,
//         redirect_uri: GOOGLE_REDIRECT_URI,
//         grant_type: "authorization_code",
//       }),
//     });

//     const tokens = await tokenRes.json();
//     const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
//       headers: { Authorization: `Bearer ${tokens.access_token}` },
//     });
//     const userInfo = await userInfoRes.json();

//     let user = await User.findOne({ email: userInfo.email });
//     if (!user) {
//       user = new User({
//         email: userInfo.email,
//         name: userInfo.name,
//         tokens,
//       });
//       await user.save();
//     } else {
//       user.tokens = tokens;
//       await user.save();
//     }

//     if (!user.paymentDone) {
//       return res.redirect(`/pay?email=${userInfo.email}`);
//     }

//     return res.redirect(
//       `${FRONTEND_REDIRECT_URL}?tokens=${encodeURIComponent(JSON.stringify(tokens))}`
//     );
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("OAuth failed");
//   }
// };

export const oauthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Missing code" });

    // 1️⃣ Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) return res.status(400).json({ error: "Token exchange failed" });

    // 2️⃣ Get user info
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userInfo = await userInfoRes.json();

    // 3️⃣ Find or create user in DB
    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      user = new User({ email: userInfo.email, paymentDone: false });
      await user.save();
    }

    // 4️⃣ Check payment
    if (!user.paymentDone) {
      return res.json({
        success: false,
        requiresPayment: true,
        email: userInfo.email
      });
    }

    // ✅ 5️⃣ Payment done → return tokens
    return res.json({
      success: true,
      tokens
    });

  } catch (err) {
    console.error("OAuth Error:", err);
    res.status(500).json({ error: "OAuth failed" });
  }
};

export const startGoogleLogin = (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/drive.file email profile",
      access_type: "offline",
      prompt: "consent"
    });

  // res.redirect(authUrl);
  res.json({ authUrl });
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: "Missing refresh token" });
    }

    // Request new tokens from Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token,
        grant_type: "refresh_token"
      })
    });

    const newTokens = await tokenRes.json();

    if (!newTokens.access_token) {
      return res.status(400).json({ error: "Failed to refresh token", details: newTokens });
    }

    // Calculate new expiry time
    if (newTokens.expires_in) {
      newTokens.expiry_date = Date.now() + newTokens.expires_in * 1000;
    }

    return res.json({ success: true, tokens: newTokens });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};
