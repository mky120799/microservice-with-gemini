# 🏦 Zenith Banking - Advanced Microservice Architecture

Zenith Banking is a production-grace FinTech platform built on a decoupled microservice architecture. It features high-priority financial ledgering, multi-layer security (2FA/RBAC), and a robust automated ticketing system.

---

## 🏛️ System Architecture

### 🛰️ Service Mesh & Communication
The platform utilizes a **Hub-and-Spoke** architecture with an **API Gateway** as the single entry point.
- **Synchronous**: Gateway proxies requests to internal services via HTTP/REST.
- **Asynchronous**: Inter-service events are broadcast via **RabbitMQ** (Exchange/Queue model).
- **Service List**:
    - **Identity (Port 3001)**: Handles Auth, OAuth2 (Google/Auth0), and TOTP 2FA.
    - **Ledger (Port 3002)**: Core accounting engine using double-entry bookkeeping.
    - **Transfer (Port 3003)**: Coordinates cross-account payments with Redis idempotency.
    - **Ticketing (Port 3007)**: Manages support lifecycle with automated cron jobs and local attachment mirroring.
    - **Notification (Port 3004)**: Real-time Socket.io & MongoDB persistence.
    - **Analytics (Port 3005)**: Time-series transaction monitoring (InfluxDB).

---

## 🔐 Security & Identity

### 🛡️ Multi-Layer Authentication
- **JWT**: Stateless session management with signatures.
- **2FA (TOTP)**: 
    - Implementation: `otplib` generated secrets, delivered via `qrcode`.
    - Verification: Mandatory 2FA token check on sign-in if enabled in user profile.
- **RBAC (Role Based Access Control)**:
    - `user`: Standard customer access.
    - `employee`: Basic staff operations.
    - `finance`: Transaction auditing and payroll access.
    - `auditor`: Full read-only access to all sensitive ticketing and ledger logs.
    - `admin`: Full system management.

---

## 🏗️ Technical Specification

### 💾 Data Models & Persistence
- **Postgres (TypeORM)**: 
    - `User`: Handles social IDs, password hashes, and 2FA secrets.
    - `Account` & `Transaction`: Implements ACID-compliant balance updates with **Pessimistic Write Locking**.
    - `Ticket` & `AuditLog`: Tracks every lifecycle change and file attachment mirror.
- **Redis**: Stores `idempotency-keys` for transfer operations (24h TTL) to prevent duplicate payments.
- **MongoDB**: Optimized for high-frequency notification history.

### 📂 Attachment Mirroring System
To ensure 100% availability in local development environments:
1. **Primary**: Files are saved to local disk (`services/ticketing/uploads`).
2. **Secondary**: Files are mirrored to Cloudinary as an asynchronous background task.
3. **Delivery**: The system prioritizes local absolute URLs to bypass cloud 401 errors.

---

## 🧪 Detailed API Reference

### Identity Service
- `POST /api/users/signup`: Create a new account.
- `POST /api/users/signin`: Standard login or 2FA challenge.
- `POST /api/users/2fa/setup`: Generates QR code for Authenticator pairing.
- `PATCH /api/users/profile`: Update name and Cloudinary avatar.

### Ticketing Service
- `POST /api/tickets`: Create support ticket (supports file attachments).
- `GET /api/tickets`: List authorized tickets (Staff see all, users see owned).
- `GET /api/tickets/:id`: Fetch ticket + full history from `AuditLog`.
- `PUT /api/tickets/:id/status`: Change ticket state (`OPEN`, `RESOLVED`, etc.).

### Ledger & Transfer
- `POST /api/transfer`: Initiate P2P transfer. **Required header**: `x-idempotency-key`.
- `GET /api/ledger/balance/:userId`: Retrieve real-time account balance.
- `GET /api/ledger/transactions`: Fetch last 10 transaction history.

---

## 🚀 Deployment & Scripts
The entire ecosystem is containerized for consistency:
- `start-all.sh`: Orchestrates Docker builds and starts the Vite frontend.
- `docker-compose.yml`: Manages 10 interconnected containers + 4 databases.
- **Cron Jobs**: The Ticketing service runs an hourly background worker for stale ticket detection.
