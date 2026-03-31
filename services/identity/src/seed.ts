import { AppDataSource } from './database';
import { User } from './models';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Connected to PostgreSQL for seeding');

    const userRepository = AppDataSource.getRepository(User);

    const users = [
      {
        email: 'admin@zenith.com',
        password: 'Zenith@123',
        role: 'admin',
      },
      {
        email: 'user@zenith.com',
        password: 'Zenith@123',
        role: 'user',
      },
      {
        email: 'auditor@zenith.com',
        password: 'Zenith@123',
        role: 'auditor',
      },
    ];

    for (const u of users) {
      const existing = await userRepository.findOne({ where: { email: u.email } });
      if (existing) {
        console.log(`User ${u.email} already exists, skipping.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 10);
      const user = userRepository.create({
        email: u.email,
        password: hashedPassword,
        role: u.role,
      });

      await userRepository.save(user);
      console.log(`Created ${u.role} user: ${u.email}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
