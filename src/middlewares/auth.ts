import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { ENV } from '../config/env';
import { ApiError } from '../utils/apiError';
import { Role } from '../generated/prisma/enums';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: Role;
      };
    }
  }
}

const auth =
  (...requiredRights: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      const payload = jwt.verify(token, ENV.jwt.secret) as any;
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      req.user = { id: user.id, role: user.role };

      if (requiredRights.length) {
        const userRights = [user.role];
        const hasRequiredRights = requiredRights.every((requiredRight) =>
          userRights.includes(requiredRight),
        );
        if (!hasRequiredRights && req.params.userId !== user.id) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
        }
      }

      next();
    } catch (error) {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
  };

export default auth;
