import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import { ENV } from '../config/env';
import { ApiError } from '../utils/apiError';
import { Role } from '../../generated/prisma/enums';
import { prisma } from '../lib/prisma';

interface AuthPayload extends JwtPayload {
  id: string;
  role: string;
}

const auth =
  (...requiredRights: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      const payload = jwt.verify(token, ENV.jwt.secret) as AuthPayload;
      const user = await prisma.user.findUnique({ where: { id: payload.id } });

      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      req.user = user;

      if (requiredRights.length) {
        const userRights = [user.role]; // Simplified rights management
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
