import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from 'common';
import { User } from './models';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppDataSource } from './database';
import { RabbitMQService } from './rabbitmq.service';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { requireAuth } from 'common';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);

// Passport Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
      callbackURL: 'http://localhost:8000/api/users/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, emails } = profile;
      const email = emails?.[0].value;

      if (!email) return done(new Error('No email found in google profile'));

      // Check by socialId + socialProvider (Priority) or email (Linking)
      // This also handles "Registration": if no user is found, we create a new one.
      let user = await userRepository.findOne({ 
        where: [
          { socialId: id, socialProvider: 'google' }, 
          { email }
        ] 
      });

      if (!user) {
        user = userRepository.create({ 
          email, 
          socialId: id,
          socialProvider: 'google',
          googleId: id, // Keeping for compatibility
          password: crypto.randomBytes(20).toString('hex')
        });
        await userRepository.save(user);
        
        await RabbitMQService.publish('user-created', {
          userId: user.id,
          email: user.email,
          role: user.role,
        });
      } else if (!user.socialId) {
        user.socialId = id;
        user.socialProvider = 'google';
        user.googleId = id;
        await userRepository.save(user);
      }

      return done(null, user);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'placeholder_fb_id',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder_fb_secret',
      callbackURL: 'http://localhost:8000/api/users/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'displayName'],
      graphApiVersion: 'v20.0',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error('No email found in facebook profile'));

      let user = await userRepository.findOne({ 
        where: [{ socialId: profile.id, socialProvider: 'facebook' }, { email }] 
      });

      if (!user) {
        user = userRepository.create({ 
          email, socialId: profile.id, socialProvider: 'facebook',
          password: crypto.randomBytes(20).toString('hex')
        });
        await userRepository.save(user);
        await RabbitMQService.publish('user-created', { userId: user.id, email: user.email, role: user.role });
      } else if (!user.socialId) {
        user.socialId = profile.id;
        user.socialProvider = 'facebook';
        await userRepository.save(user);
      }
      return done(null, user);
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY || 'placeholder_tw_key',
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'placeholder_tw_secret',
      callbackURL: 'http://localhost:8000/api/users/auth/twitter/callback',
      includeEmail: true,
      proxy: true,
    },
    async (token, tokenSecret, profile, done) => {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error('No email found in twitter profile'));

      let user = await userRepository.findOne({ 
        where: [{ socialId: profile.id, socialProvider: 'twitter' }, { email }] 
      });

      if (!user) {
        user = userRepository.create({ 
          email, socialId: profile.id, socialProvider: 'twitter',
          password: crypto.randomBytes(20).toString('hex')
        });
        await userRepository.save(user);
        await RabbitMQService.publish('user-created', { userId: user.id, email: user.email, role: user.role });
      } else if (!user.socialId) {
        user.socialId = profile.id;
        user.socialProvider = 'twitter';
        await userRepository.save(user);
      }
      return done(null, user);
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await userRepository.findOne({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// OAuth Routes
router.get(
  '/api/users/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/api/users/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user as User;
    const userJwt = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_KEY!
    );
    req.session = { jwt: userJwt };
    res.redirect('http://localhost:5173/dashboard');
  }
);

// ── Auth0 Strategy ──────────────────────────────────────────────────────────
passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN || 'YOUR_AUTH0_DOMAIN.auth0.com',
      clientID: process.env.AUTH0_CLIENT_ID || 'placeholder_auth0_client_id',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || 'placeholder_auth0_client_secret',
      callbackURL: 'http://localhost:8000/api/users/auth/auth0/callback',
      proxy: true,
    },
    async (accessToken: string, refreshToken: string, extraParams: any, profile: any, done: any) => {
      console.log('[Identity] Auth0 Callback received for profile:', profile.id);
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email found in Auth0 profile'));

      // Check by socialId + socialProvider or email
      let user = await userRepository.findOne({ 
        where: [
          { socialId: profile.id, socialProvider: 'auth0' }, 
          { email }
        ] 
      });

      if (!user) {
        user = userRepository.create({
          email,
          socialId: profile.id,
          socialProvider: 'auth0',
          password: crypto.randomBytes(20).toString('hex'),
        });
        await userRepository.save(user);
        await RabbitMQService.publish('user-created', {
          userId: user.id,
          email: user.email,
          role: user.role,
        });
      } else if (!user.socialId) {
        user.socialId = profile.id;
        user.socialProvider = 'auth0';
        await userRepository.save(user);
      }
      return done(null, user);
    }
  )
);

// Auth0 Routes
router.get(
  '/api/users/auth/auth0',
  passport.authenticate('auth0', { scope: 'openid email profile', session: false })
);

router.get(
  '/api/users/auth/auth0/callback',
  passport.authenticate('auth0', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user as User;
    const userJwt = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_KEY!
    );
    req.session = { jwt: userJwt };
    res.redirect('http://localhost:5173/dashboard');
  }
);

// Facebook Routes
router.get('/api/users/auth/facebook', passport.authenticate('facebook', { scope: 'email,public_profile', session: false }));
router.get('/api/users/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as User;
  const userJwt = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_KEY!);
  req.session = { jwt: userJwt };
  res.redirect('http://localhost:5173/dashboard');
});

// Twitter Routes
router.get('/api/users/auth/twitter', passport.authenticate('twitter', { session: false }));
router.get('/api/users/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login', session: false }), (req, res) => {
  const user = req.user as User;
  const userJwt = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_KEY!);
  req.session = { jwt: userJwt };
  res.redirect('http://localhost:5173/dashboard');
});

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
    const { email, password, token } = req.body;

    const existingUser = await userRepository.findOne({ where: { email } });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // 2FA Check
    if (existingUser.isTwoFactorEnabled) {
      if (!token) {
        return res.status(200).send({ 
          twoFactorRequired: true, 
          message: '2FA Token Required' 
        });
      }

      const isValid = authenticator.check(token, existingUser.twoFactorSecret);
      if (!isValid) {
        throw new BadRequestError('Invalid 2FA token');
      }
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

router.post('/api/users/2fa/setup', requireAuth, async (req: Request, res: Response) => {
  const user = await userRepository.findOne({ where: { id: req.currentUser!.id } });
  if (!user) throw new BadRequestError('User not found');

  const secret = authenticator.generateSecret();
  user.twoFactorSecret = secret;
  await userRepository.save(user);

  const otpauth = authenticator.keyuri(user.email, 'Zenith Bank', secret);
  const qrCodeDataURL = await QRCode.toDataURL(otpauth);

  res.send({ qrCodeDataURL, secret });
});

router.post('/api/users/2fa/verify', requireAuth, async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = await userRepository.findOne({ where: { id: req.currentUser!.id } });
  if (!user || !user.twoFactorSecret) throw new BadRequestError('2FA not set up');

  const isValid = authenticator.check(token, user.twoFactorSecret);
  if (!isValid) throw new BadRequestError('Invalid token');

  user.isTwoFactorEnabled = true;
  await userRepository.save(user);

  res.send({ success: true, message: '2FA enabled successfully' });
});

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
