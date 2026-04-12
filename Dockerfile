FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy ALL workspace package.json files to optimize dependency caching
# (Even if a service doesn't use all of them, modern npm needs the full workspace set for lockfile consistency)
COPY libs/common/package.json ./libs/common/
COPY services/analytics/package.json ./services/analytics/
COPY services/email/package.json ./services/email/
COPY services/gateway/package.json ./services/gateway/
COPY services/identity/package.json ./services/identity/
COPY services/ledger/package.json ./services/ledger/
COPY services/notification/package.json ./services/notification/
COPY services/payment/package.json ./services/payment/
COPY services/ticketing/package.json ./services/ticketing/
COPY services/transfer/package.json ./services/transfer/
# Include frontend just to satisfy workspace requirements during root install
COPY frontend/package.json ./frontend/

# Install dependencies (shared across all services)
RUN npm install

# Build Arguments
ARG SERVICE_NAME
ARG START_COMMAND="npm run dev"
ENV START_COMMAND=${START_COMMAND}

# Copy source code for common library and the specific service
COPY libs/common ./libs/common
COPY services/${SERVICE_NAME} ./services/${SERVICE_NAME}

# Set working directory to the specific service
WORKDIR /app/services/${SERVICE_NAME}

# Expose ports based on service (optional, as docker-compose handles it)
# EXPOSE 3000-3007

# Run the start command
CMD ${START_COMMAND}
