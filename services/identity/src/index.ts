import { AppDataSource } from './database';
import { app } from './app';
import { RabbitMQService } from './rabbitmq.service';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST must be defined');
  }

  try {
    await AppDataSource.initialize();
    console.log('Connected to PostgreSQL');
    RabbitMQService.init().catch(err => console.error('RabbitMQ Init Error:', err));
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
