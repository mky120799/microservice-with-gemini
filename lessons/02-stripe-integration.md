# Lesson 2: Stripe Integration & Webhooks

In this lesson, we integrated a real-world payment provider (Stripe) into our microservice architecture. Here is a breakdown of how it works.

## 1. The Payment Flow
When a user clicks "Top Up" in the Dashboard:
1.  **Intent Creation**: The frontend sends the amount to `/api/payments/create-intent`.
2.  **Stripe API Call**: Our `payment-service` calls Stripe to create a **Payment Intent**. Stripe returns a `clientSecret`.
3.  **Secure UI**: The frontend uses the `clientSecret` to initialize **Stripe Elements** (the secure card input form).
4.  **Direct Confirmation**: When the user clicks "Pay," the card details are sent **directly from the user's browser to Stripe**. Our server never sees the card number!
5.  **Success**: Stripe confirms the payment and returns success to the browser.

---

## 2. Why use Webhooks?
In Lesson 2, we added a **Webhook Handler** at `/api/payments/webhook`.

**Why?** Because what if the user closes their browser right after paying, but before our frontend can tell our backend?
- **Webhooks** are "Server-to-Server" notifications. 
- Stripe sends a request to our server to say: *"Hey, payment `pi_123` was successful!"*
- Our server verifies the message and then updates the user's balance in the `ledger-service`.

---

## 3. The New `payment-service`
This service acts as an abstraction layer. 
- It handles all the "Stripe talk" (SDK, API keys).
- It translates "Successful Stripe Payment" into "Add balance to Ledger."
- This keeps the `ledger-service` simple—it only cares about credits and debits, not *how* the money got there.

---

## 🛠️ Testing Tip
Since we are in **Test Mode**, you can use Stripe's test card numbers:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any date in the future
- **CVC**: Any 3 digits
- **Zip**: Any 5 digits

---

## 🏁 Summary
You now have a functional payment gateway! 
- **Security**: Card data never touches your server.
- **Scalability**: Payments are handled by a dedicated service.
- **Reliability**: Webhooks ensure balances are updated even if the user disconnects.

What would you like to explore next? We could add **Email Notifications** for payments or build a **Transaction History** view!
