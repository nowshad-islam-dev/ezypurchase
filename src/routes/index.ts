import express from 'express';
import authRouter from './auth.route';

const router = express.Router();

const defaultRoutes: { path: string; route: any }[] = [
  {
    path: '/auth',
    route: authRouter,
  },
];

defaultRoutes.forEach((r) => {
  router.use(r.path, r.route);
});

export default router;
