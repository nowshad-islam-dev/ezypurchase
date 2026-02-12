import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import { userService } from './user.service';
import { tokenService } from './token.service';
import { ApiError } from '../utils/apiError';
import { TokenType } from '../generated/prisma/enums';
import { prisma } from '../lib/prisma';

const loginUserWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

const logout = async (refreshToken: string) => {
  const refreshTokenDoc = await tokenService.verifyToken(
    refreshToken,
    TokenType.REFRESH,
  );
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
};

const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      TokenType.REFRESH,
    );
    const user = await userService.getUserById(refreshTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export const authService = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
};
