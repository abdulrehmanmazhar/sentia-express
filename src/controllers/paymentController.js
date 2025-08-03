import Stripe from "stripe";
import User from "../models/Users.js";
import PromoCode from "../models/PromoCode.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export const createCheckoutSession = async (req, res) => {
  try {
    const { email, promoCode } = req.body;
    
    // Validate email format here if needed
    
    let amount = 5000; // $50 default
    let appliedPromo = null;

    if (promoCode) {
      const promo = await PromoCode.findOne({ 
        code: promoCode, 
        active: true 
      });
      if (promo) {
        amount = Math.max(0, amount - promo.discountAmount); // Prevent negative amounts
        appliedPromo = promo.code;
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "Sentia Lifetime Access",
              metadata: {
                promo_code: appliedPromo || "none"
              } 
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_email: email,
        promo_code: appliedPromo || "none"
      },
      success_url: `${process.env.FRONTEND_REDIRECT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_REDIRECT_URL}/payment/cancel`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ 
      error: "Failed to create session",
      details: err.message 
    });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Additional verification
        if (session.payment_status === 'paid') {
          await User.findOneAndUpdate(
            { email: session.customer_email },
            { 
              paymentDone: true,
              paymentDetails: {
                amount_paid: session.amount_total / 100,
                currency: session.currency,
                promo_code: session.metadata.promo_code
              }
            }
          );
          
          // Here you could trigger email confirmation, etc.
        }
        break;

      case 'checkout.session.async_payment_failed':
        // Handle failed payments
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};