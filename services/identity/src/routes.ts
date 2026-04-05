import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from 'common';
import { User } from './models';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppDataSource } from './database';
import { RabbitMQService } from './rabbitmq.service';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({ email, password: hashedPassword });
    await userRepository.save(user);

    // Publish user-created event
    await RabbitMQService.publish('user-created', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must supply a password'),
  ],
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await userRepository.findOne({ where: { email } });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

router.post('/api/users/signout', (req: Request, res: Response) => {
  req.session = null;
  res.send({});
});

router.get('/api/users/currentuser', (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
});

router.get('/api/users/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await userRepository.findOne({ where: { id: parseInt(id) } });

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  res.send({
    id: user.id,
    email: user.email,
    role: user.role,
  });
});

router.post(
  '/api/users/forgot-password',
  [body('email').isEmail().withMessage('Email must be valid')],
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      // For security, don't reveal if user exists, but we'll return 200
      return res.status(200).send({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await userRepository.save(user);

    await RabbitMQService.publish('password-reset-requested', {
      userId: user.id,
      email: user.email,
      token,
    });

    res.status(200).send({ message: 'If an account with that email exists, a reset link has been sent.' });
  }
);

router.post(
  '/api/users/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const user = await userRepository.findOne({ 
      where: { resetToken: token } 
    });

    if (!user || (user.resetTokenExpiry && user.resetTokenExpiry < new Date())) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null as any;
    user.resetTokenExpiry = null as any;
    await userRepository.save(user);

    res.status(200).send({ message: 'Password has been successfully reset' });
  }
);

export { router as authRouter };
