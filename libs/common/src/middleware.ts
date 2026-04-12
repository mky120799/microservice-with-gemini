import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError, NotAuthorizedError, ForbiddenError } from './errors';

interface UserPayload {
  id: number;
  email: string;
  role: string;
  name?: string;
  avatarUrl?: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  console.error(err);
  res.status(500).send({
    errors: [{ message: 'Something went wrong' }],
  });
};

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
  // 1. Check for Gateway-injected headers (Priority)
  if (req.headers['x-user-id'] && req.headers['x-user-role'] && req.headers['x-user-email']) {
    req.currentUser = {
      id: parseInt(req.headers['x-user-id'] as string),
      role: req.headers['x-user-role'] as string,
      email: req.headers['x-user-email'] as string,
    };
    return next();
  }

  // 2. Fallback to Session JWT (if cookie is passed directly to microservice)
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

    if (!roles.includes(req.currentUser.role)) {
      throw new ForbiddenError();
    }

    next();
  };
};
