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
COPY services/ticketing/package.json ./services/ticketing/

# Install ALL dependencies
RUN npm install

# Copy source code
COPY libs/common ./libs/common
COPY services/ticketing ./services/ticketing

WORKDIR /app/services/ticketing

CMD ["npm", "run", "start:dev"]
