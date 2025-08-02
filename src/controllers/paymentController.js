import Stripe from "stripe";
import User from "../models/Users.js";
import PromoCode from "../models/PromoCode.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { email, promoCode } = req.body;
    let amount = 5000; // $50 default

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode, active: true });
      if (promo) amount -= promo.discountAmount;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Sentia Lifetime Access" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_REDIRECT_URL}?payment=success&email=${email}`,
      cancel_url: `${process.env.FRONTEND_REDIRECT_URL}?payment=cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).send("Failed to create session");
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email;
      await User.findOneAndUpdate({ email }, { paymentDone: true });
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
