import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3002, '0.0.0.0');
  console.log(`Ledger Service is running on: ${await app.getUrl()}`);
}
bootstrap();
