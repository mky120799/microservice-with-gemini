import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.url}`);
  next();
});

const services = [
  {
    path: '/api/users',
    target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
  },
  {
    path: '/api/ledger',
    target: process.env.LEDGER_SERVICE_URL || 'http://localhost:3002',
  },
  {
    path: '/api/transfer',
    target: process.env.TRANSFER_SERVICE_URL || 'http://localhost:3003',
  },
  {
    path: '/socket.io',
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
    ws: true,
  },
  {
    path: '/api/analytics',
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3005',
  },
  {
    path: '/api/payments',
    target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  },
];

services.forEach((service) => {
  app.use(
    createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathFilter: service.path,
      ws: (service as any).ws || false,
    })
  );
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
