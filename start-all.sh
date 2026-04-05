#!/bin/bash

# start-all.sh - Unified startup script for Zenith Banking

echo "🚀 Starting Zenith Banking Microservices..."

# 0. Sync Stripe Webhook Secret
if command -v stripe &> /dev/null; then
    echo "🔒 Syncing Stripe local Webhook Secret..."
    # Retrieve the persistent secret for the current local login session
    STRIPE_WEBHOOK_SECRET=$(stripe listen --print-secret)
    if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
        # Update .env using sed, cross-platform compatibility
        sed -i.bak "s/^STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET/" .env
        rm -f .env.bak
        echo "✅ Updated .env with Stripe Webhook Secret: $STRIPE_WEBHOOK_SECRET"
    fi
fi

# 1. Start Docker containers (Databases and Backend Services)
echo "📦 Starting Backend Services (Docker)..."
docker-compose up --build -d

if [ $? -ne 0 ]; then
    echo "❌ Error starting Docker services. Please make sure Docker Desktop is running."
    exit 1
fi

# 2. Start Frontend Dev Server
echo "🌐 Starting Frontend (Vite)..."
cd frontend && npm run dev &
cd ..

# 3. Start Stripe Webhook Tunnel
if command -v stripe &> /dev/null; then
    echo "🔗 Starting Stripe Webhook listener in background..."
    stripe listen --forward-to localhost:3006/api/payments/webhook > stripe_webhook.log 2>&1 &
fi

echo "✅ All services are starting up!"
echo "📡 Gateway: http://localhost:8000"
echo "🖥️  Frontend: http://localhost:5173"
echo "📊 RabbitMQ Management: http://localhost:15672"
echo ""
echo "Note: It might take a moment for all backend services to become healthy."
echo "Use 'docker-compose logs -f' to monitor backend logs."
echo "Press Ctrl+C to stop all services (Backend, Frontend, and Stripe payload tunneling)."

# Wait for background processes
wait
