const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../model/webhookModel");

const striptrans = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the event using Stripe's signature
    console.log("Attempting to construct Stripe event.");
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("Stripe event constructed successfully:", event);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment intent succeeded:", paymentIntent);

      // Check if metadata is present
      if (!paymentIntent.metadata || !paymentIntent.metadata.userId) {
        console.error("UserId missing in metadata.");
        return res.status(400).send("UserId is required in metadata.");
      }

      // Save payment details to the database
      try {
        const transaction = new Transaction({
          userId: paymentIntent.metadata.userId,
          amount: paymentIntent.amount_received / 100,
          currency: paymentIntent.currency,
          paymentStatus: paymentIntent.status,
          paymentMethod: paymentIntent.payment_method,
          transactionId: paymentIntent.id,
        });
        console.log("Attempting to save transaction:", transaction);
        await transaction.save();
        console.log("Transaction successfully saved:", transaction);
      } catch (error) {
        console.error("Error saving transaction to database:", error.message);
        return res.status(500).send("Internal Server Error");
      }
      break;

    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
};

module.exports = { striptrans };
