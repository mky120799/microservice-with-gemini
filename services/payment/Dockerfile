FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json .
COPY package-lock.json* .

# Copy ALL workspace package.json files
COPY libs/common/package.json ./libs/common/
COPY services/gateway/package.json ./services/gateway/
COPY services/identity/package.json ./services/identity/
COPY services/ledger/package.json ./services/ledger/
COPY services/transfer/package.json ./services/transfer/
COPY services/notification/package.json ./services/notification/
COPY services/analytics/package.json ./services/analytics/
COPY services/payment/package.json ./services/payment/

# Install ALL dependencies
RUN npm install

# Copy source code
COPY libs/common ./libs/common
COPY services/payment ./services/payment

WORKDIR /app/services/payment

CMD ["npm", "run", "dev"]
