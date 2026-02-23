import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { cartService } from '../services/cart.service';

const getCart = async (req: Request, res: Response) => {
  const cart = await cartService.getCartByUserId(req.user.id);
  res.send(cart);
};

const addItemToCart = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const cartItem = await cartService.addItemToCart(req.user.id, productId, quantity);
  res.status(httpStatus.CREATED).send(cartItem);
};

const updateCartItem = async (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  const cartItem = await cartService.updateItemQuantity(req.user.id, productId, quantity);
  res.send(cartItem);
};

const removeItemFromCart = async (req: Request, res: Response) => {
  await cartService.removeItemFromCart(req.user.id, req.body.productId);
  res.status(httpStatus.NO_CONTENT).send();
};

export const cartController = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
};
