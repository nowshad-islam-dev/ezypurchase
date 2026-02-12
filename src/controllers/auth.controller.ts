import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { tokenService } from '../services/token.service';

const register = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
};

const logout = async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
};

const refreshTokens = async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
};

export const authController = {
  register,
  login,
  logout,
  refreshTokens,
};
