#!/bin/bash

# start-all.sh - Unified startup script for Zenith Banking

echo "🚀 Starting Zenith Banking Microservices..."

# 1. Start Docker containers (Databases and Backend Services)
echo "📦 Starting Backend Services (Docker)..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Error starting Docker services. Please make sure Docker Desktop is running."
    exit 1
fi

# 2. Start Frontend Dev Server
echo "🌐 Starting Frontend (Vite)..."
cd frontend && npm run dev &

# Return to root
cd ..

echo "✅ All services are starting up!"
echo "📡 Gateway: http://localhost:8000"
echo "🖥️  Frontend: http://localhost:5173"
echo "📊 RabbitMQ Management: http://localhost:15672"
echo ""
echo "Note: It might take a moment for all backend services to become healthy."
echo "Use 'docker-compose logs -f' to monitor backend logs."

# Wait for background processes
wait
