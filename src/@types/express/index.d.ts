import { Request } from 'express';
import { User } from '../../generated/prisma/client';
type Payload = Pick<User, 'id' | 'role'>;

declare global {
  namespace Express {
    interface Request {
      user: Payload;
    }
  }
}

export {};
