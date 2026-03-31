# Lesson 3: Production-Ready Payments & Security

In this lesson, we upgraded our payment system to handle real-world challenges like network failures, security attacks, and data consistency.

## 1. Persistence & Traceability
We added a **Database** to the `payment-service`. 
- Every time a user starts a payment, we save it as `PENDING`.
- This allows us to track *abandoned* payments and investigate *disputed* transactions.
- In production, you never want your only record of a payment to be "it's in Stripe's dashboard." You need your own audit trail.

---

## 2. Webhook Signature Verification
We implemented `stripe.webhooks.constructEvent`.
- **The Problem**: Anyone who knows your webhook URL could send "Fake Success" messages to your server to get free money.
- **The Solution**: Stripe signs every webhook request with a secret key. Our server now verifies this signature to prove the message actually came from Stripe.

---

## 3. Idempotency (The "Double Credit" Problem)
Webhooks are delivered **"At Least Once."** This means Stripe might send the same "Payment Succeeded" message two or three times if your server is slow to respond.
- **The Risk**: Without idempotency, a user pays $100 once, but your ledger adds $100 three times!
- **The Solution**: We now check if the `PaymentIntent` ID has already been marked as `COMPLETED` in our database. If it has, we ignore the duplicate message.

---

## 4. The Fulfillment Pattern
We decoupled the **Payment** from the **Fulfillment**:
1.  Payment happens on Stripe.
2.  Fulfillment happens asynchronously via the Webhook.
3.  The `payment-service` coordinates with the `ledger-service`.

This pattern ensures that even if the `ledger-service` is temporarily down, Stripe can retry the webhook later, and the user will eventually get their money!

---

## 🚀 Final Configuration
To test the signature verification, you MUST set the `STRIPE_WEBHOOK_SECRET` in your `.env` file. You get this secret by running:
```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```

You've built a world-class, production-ready payment microservice! What's next on your roadmap?
