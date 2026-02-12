import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { User } from '../generated/prisma/client';
import { UserCreateInput } from '../generated/prisma/models';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';

const isEmailTaken = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
};

const createUser = async (userBody: UserCreateInput): Promise<User> => {
  if (await isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const hashedPassword = await bcrypt.hash(userBody.password, 10);
  const user = await prisma.user.create({
    data: { ...userBody, password: hashedPassword },
  });
  return user;
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};

const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const userService = {
  createUser,
  getUserByEmail,
  getUserById,
  isEmailTaken,
};
