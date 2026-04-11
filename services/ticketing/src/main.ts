import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import express from 'express';

import { currentUser } from 'common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use common middleware to populate req.currentUser from headers or session
  app.use(currentUser);
  
  // Static route for serving attachments
  app.use('/api/tickets/attachments', express.static(join(process.cwd(), 'uploads')));
  
  const port = 3007;
  await app.listen(port);
  console.log(`🚀 Ticketing Service is running on port ${port}`);
}
bootstrap();
