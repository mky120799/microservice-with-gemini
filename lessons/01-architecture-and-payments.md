# Lesson 1: Microservice Architecture & Real-World Payments

Welcome to your learning journey! This file explains how your current project works and what it would take to turn it into a real-world banking app.

## 1. How the Architecture Works
Your project uses a **Microservice Architecture**. Instead of one giant app, it's split into small, specialized services:

- **API Gateway (Port 8000)**: The "front door." It receives all requests from the frontend and routes them to the correct backend service.
- **Identity Service**: Handles user registration and login (using JWT for security).
- **Ledger Service**: Manages "balances" and transaction history in a database.
- **Transfer Service**: Coordinates moving money between accounts.
- **Notification Service**: Sends alerts (like "You received $100") using RabbitMQ (a message broker).
- **Analytics Service**: Tracks trends and usage data using InfluxDB (a time-series database).

---

## 2. Can we transfer "Real" Funds?
In this practice project, **no**. The "money" here is just numbers in a database. 

To transfer real money, you need to connect to **Banking Rails**:
1.  **ACH / Wire Transfers**: You would need to integrate with an API like **Plaid** (to link bank accounts) and **Dwolla** (to move the money).
2.  **Payment Processors**: Integration with **Stripe** or **PayPal**.
3.  **Bank APIs**: Direct integration with a bank (like JP Morgan Chase or a regional bank), which requires a special partnership.

---

## 3. Adding Card Details (The Security Challenge)
You *could* add a form to collect card details, but **you should never store raw card numbers** in your database unless you are **PCI-DSS Compliant**.

### How real apps do it:
- **Tokenization**: When a user enters their card info, it is sent directly to a provider like **Stripe**. Stripe gives you a "Token" (a random string) that represents the card.
- **You store the Token**, not the card number. This way, if your database is hacked, the hacker only finds useless tokens, not credit card numbers.

### If you want to build this:
We can create a **"Mock Card"** feature where you enter fake card details to see how the UI and validation work, without actually risking real data!

---

## 🚀 Next Steps
Would you like to try building a **Mock Card Management** feature next to see how the security flow would look?
