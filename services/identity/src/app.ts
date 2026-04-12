import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from 'common';
import passport from 'passport';
import { authRouter } from './routes';

const app = express();
app.set('trust proxy', true);
app.use(json({ limit: '10mb' }));
app.use(
  cookieSession({
    name: 'zenith_session',
    signed: false,
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax',
  })
);

// Fix Passport 0.6+ compatibility with cookie-session
app.use((req: any, res, next) => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb: any) => cb();
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb: any) => cb();
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(currentUser);
app.use(authRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
