import { DataSource } from 'typeorm';
import { User } from './models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: 'zenith_user',
  password: 'zenith_password',
  database: 'zenith_bank',
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
