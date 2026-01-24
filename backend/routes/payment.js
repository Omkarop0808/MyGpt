import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.use(authenticate);

// Create Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pro Plan",
              description: "Unlock premium features",
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      mode: "payment", // Use 'subscription' if you set up recurring prices
      success_url: `${req.headers.origin}/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/upgrade?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Verify Payment
router.post("/verify-payment", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
       // Update user plan
       const userId = session.metadata.userId; // Securely get user from metadata
       
       // Verify the user making the request matches the session user (optional but good)
       if (userId !== req.user.id) {
           return res.status(403).json({ error: "Unauthorized" });
       }

       await User.findByIdAndUpdate(userId, { subscriptionPlan: "pro" });
       
       return res.json({ success: true, plan: "pro" });
    } else {
        return res.json({ success: false, status: session.payment_status });
    }

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
