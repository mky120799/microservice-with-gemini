import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from 'common';
import { User } from './models';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './database';

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

export { router as authRouter };
