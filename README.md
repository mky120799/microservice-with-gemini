# 🏦 Zenith Banking - Advanced Microservice Architecture

Zenith Banking is a state-of-the-art FinTech platform built on a robust, decoupled microservice architecture. It features high-integrity financial ledgering, real-time notifications, multi-layer security, and an automated ticketing system.

---

## 🏛️ Architecture Overview
- **API Gateway (Port 8000)**: Single entry point with CORS and rate-limiting.
- **Identity Service**: 
    - Full Auth & RBAC (Postgres).
    - **🔐 Two-Factor Authentication (2FA)**: Integrated TOTP support with QR code pairing.
- **Ticketing Service**: 
    - Automated customer support core (NestJS + Postgres).
    - **📂 Local Mirroring**: High-reliability attachment system with Cloudinary background backup.
    - **🕒 Automated Tasks**: Cron-driven stale ticket detection and archiving.
- **Ledger Service**: Core banking engine utilizing double-entry bookkeeping (Postgres).
- **Transfer Service**: High-concurrency payments with Redis-backed idempotency.
- **Notification Service**: MongoDB-backed real-time push system (Socket.io).
- **Analytics Service**: Time-series transaction insights and ticketing metrics (InfluxDB).
- **Cookie Consent**: GDPR-compliant frontend consent management system.

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js v22.12+ (for local frontend development)

### 🛠️ Installation & Running
1. Clone the repository.
2. Ensure your `.env` contains valid Cloudinary and Stripe credentials.
3. Start the entire ecosystem:
   ```bash
   ./start-all.sh
   # OR
   docker-compose up --build
   ```

---

## 🏗️ Core Features & Testing

### 🟢 Identity & Security
1. **Signup/Signin**: `POST /api/users/signup` | `POST /api/users/signin`
2. **2FA Setup**: Scan the QR code provided during the 2FA connection flow using Google Authenticator.

### 🟢 Ticketing & Support
1. **Submit Ticket**: `POST /api/tickets` (Multipart/form-data with `attachment`).
2. **List Tickets**: `GET /api/tickets` (Returns signed Cloudinary URLs + Local Mirror links).
3. **Analytics**: `GET /api/tickets/analytics` (Authorized Staff Only).

### 🟢 Financial Operations
1. **Transfer**: `POST /api/transfer` (Requires `x-idempotency-key` header).
2. **Balance**: `GET /api/ledger/balance/:userId`.

---

## 🛡️ Reliability Features
- **Dual-Storage Attachments**: Tickets save files to the local `uploads/` volume and mirror them to Cloudinary.
- **Dead Letter Queues**: RabbitMQ handles retry logic for failed service-to-service messages.
- **Audit Logging**: Every ticket status or priority change is tracked in an immutable `audit_log` table.

---

## 🛠️ Technology Stack
- **NestJS & Express**: Backend frameworks.
- **React, Vite & Tailwind**: Frontend experience.
- **Postgres, Redis, MongoDB, InfluxDB**: Diverse polyglot persistence.
- **RabbitMQ**: Message-driven synchronization.
- **Cloudinary**: Media management as a secondary mirror.
- **Stripe**: Payment processing integration.
