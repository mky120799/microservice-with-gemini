import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

import cookieSession from 'cookie-session';
import jwt from 'jsonwebtoken';

const app = express();
app.set('trust proxy', true);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(
  cookieSession({
    signed: false,
    secure: false, // In production, this should be true with HTTPS
  })
);

// Request Logger
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.url}`);
  next();
});

const services = [
  {
    path: '/api/users',
    target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3000',
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
  {
    path: '/api/tickets',
    target: process.env.TICKETING_SERVICE_URL || 'http://localhost:3007',
  },
];

services.forEach((service) => {
  app.use(
    createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathFilter: service.path,
      ws: (service as any).ws || false,
      onProxyReq: (proxyReq, req: any) => {
        if (req.session?.jwt) {
          try {
            const payload = jwt.verify(
              req.session.jwt,
              process.env.JWT_KEY || 'asdf'
            ) as any;
            
            proxyReq.setHeader('x-user-id', payload.id.toString());
            proxyReq.setHeader('x-user-role', payload.role);
            proxyReq.setHeader('x-user-email', payload.email);
            console.log(`[Gateway] Injected headers for user ${payload.email}`);
          } catch (err) {
            console.log('[Gateway] JWT verification failed');
          }
        }
      },
    })
  );
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
