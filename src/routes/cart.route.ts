import express from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import {
  addToCart,
  updateCartItem,
  removeFromCart,
} from '../validations/cart.validation';
import { cartController } from '../controllers/cart.controller';

const router = express.Router();

router.use(auth()); // All cart routes require auth

router
  .route('/')
  .get(cartController.getCart)
  .post(validate(addToCart), cartController.addItemToCart)
  .patch(validate(updateCartItem), cartController.updateCartItem)
  .delete(validate(removeFromCart), cartController.removeItemFromCart);

export default router;
