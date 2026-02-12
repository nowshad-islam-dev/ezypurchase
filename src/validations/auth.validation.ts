import { z } from 'zod';

const password = z.string().min(8, 'Password must be at least 8 characters');

export const register = {
  body: z.object({
    email: z.email(),
    password,
    name: z.string().min(1),
  }),
};

export const login = {
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
};

export const refreshTokens = {
  body: z.object({
    refreshToken: z.string(),
  }),
};
