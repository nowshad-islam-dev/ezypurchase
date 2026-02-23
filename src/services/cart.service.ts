import httpStatus from 'http-status';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';
import { productService } from './product.service';

const getCartByUserId = async (userId: string) => {
  return prisma.cart.findUnique({
    where: { userId },
    include: { cartItems: { include: { product: true } } },
  });
};

const addItemToCart = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const product = await productService.getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.stock <= 0 || product.stock < quantity) {
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      'Not enough product in stock',
    );
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    return prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }
};

const updateItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (!existingItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not in cart');
  }

  return prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity },
  });
};

const removeItemFromCart = async (userId: string, productId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });
  if (!existingItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not in cart');
  }

  return prisma.cartItem.delete({ where: { id: existingItem.id } });
};

export const cartService = {
  getCartByUserId,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
};
