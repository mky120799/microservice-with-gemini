# Zenith Banking - Microservice Architecture

This is a production-level FinTech microservice project built with Node.js, Express, NestJS, and multiple database strategies.

## 🏛️ Architecture Overview
- **API Gateway (Port 8000)**: Entry point for all services.
- **Identity Service**: Auth & RBAC (Postgres).
- **Ledger Service**: Core banking, double-entry bookkeeping (Postgres).
- **Transfer Service**: P2P Payments with idempotency (Redis).
- **Notification Service**: Real-time push notifications (MongoDB + Socket.io).
- **Analytics Service**: Time-series transaction insights (InfluxDB).
- **Event Bus**: RabbitMQ for asynchronous inter-service communication.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose

### 🛠️ Installation & Running
1. Clone the repository.
2. Start the entire ecosystem:
   ```bash
   docker-compose up --build
   ```

## 🧪 Testing the Flow
1. **Signup**: `POST /api/users/signup`
2. **Signin**: `POST /api/users/signin`
3. **Transfer**: `POST /api/transfer` (requires an idempotency key).
4. **Balance**: `GET /api/ledger/balance/:userId`
5. **Real-time Notifications**: Connect to `ws://localhost:8000/socket.io` and listen for `notification-{userId}`.

## 🛠️ Key Technologies
- **Node.js**: The core runtime.
- **NestJS**: For structured domain logic (Ledger).
- **TypeORM**: Database ORM with ACID transaction support.
- **RabbitMQ**: Message broker for decoupled services.
- **Redis**: For high-speed idempotency checks.
- **Socket.io**: For real-time user updates.
