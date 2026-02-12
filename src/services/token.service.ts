import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { ENV } from '../config/env';
import { prisma } from '../lib/prisma';
import { TokenType } from '../generated/prisma/enums';
import { Token } from '../generated/prisma/client';

const generateToken = (
  userId: string,
  expires: Moment,
  type: TokenType,
  secret = ENV.jwt.secret,
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const saveToken = async (
  token: string,
  userId: string,
  expires: Moment,
  type: TokenType,
  blacklisted = false,
): Promise<Token> => {
  const tokenDoc = await prisma.token.create({
    data: {
      token,
      userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    },
  });
  return tokenDoc;
};

const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
  const payload = jwt.verify(token, ENV.jwt.secret) as any;
  const tokenDoc = await prisma.token.findFirst({
    where: { token, type, userId: payload.sub, blacklisted: false },
  });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const generateAuthTokens = async (user: { id: string }) => {
  const accessTokenExpires = moment().add(
    ENV.jwt.accessExpirationMinutes,
    'minutes',
  );
  const accessToken = generateToken(
    user.id,
    accessTokenExpires,
    TokenType.ACCESS,
  );

  const refreshTokenExpires = moment().add(
    ENV.jwt.refreshExpirationDays,
    'days',
  );
  const refreshToken = generateToken(
    user.id,
    refreshTokenExpires,
    TokenType.REFRESH,
  );
  await saveToken(
    refreshToken,
    user.id,
    refreshTokenExpires,
    TokenType.REFRESH,
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

export const tokenService = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
};
