import express from 'express';
import authRouter from './auth.route';
import productRouter from './product.route';

const router = express.Router();

const defaultRoutes: { path: string; route: any }[] = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/product',
    route: productRouter,
  },
];

defaultRoutes.forEach((r) => {
  router.use(r.path, r.route);
});

export default router;
