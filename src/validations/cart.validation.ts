import { z } from 'zod';

export const addToCart = {
  body: z.object({
    productId: z.uuid(),
    quantity: z.string().transform((val, ctx) => {
      try {
        const num = parseInt(val, 10);
        return num < 1 ? 1 : num;
      } catch (err) {
        ctx.issues.push({
          code: 'custom',
          message: 'Error parsing quantity. Provide a number greater than 0',
          input: val,
        });
      }
    }),
  }),
};

export const updateCartItem = {
  body: z.object({
    productId: z.uuid(),
    quantity: z.string().transform((val) => {
      const num = parseInt(val, 10);
      return num < 0 ? 0 : num;
    }),
  }),
};

export const removeFromCart = {
  body: z.object({
    productId: z.uuid(),
  }),
};

export const createOrder = {
  body: z.object({
    // payment details etc.
  }),
};
