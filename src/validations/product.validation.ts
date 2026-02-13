import { z } from 'zod';

export const createProduct = {
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.string().transform((val) => {
      const num = parseInt(val, 10);
      return num < 0 ? 0 : num;
    }),
    stock: z.string().transform((val) => {
      const num = parseInt(val, 10);
      return num < 0 ? 0 : num;
    }),
    images: z.array(z.url()).optional(),
  }),
};

export const getProducts = {
  query: z.object({
    name: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .optional(),
  }),
};

export const getProduct = {
  params: z.object({
    productId: z.uuid(),
  }),
};

export const updateProduct = {
  params: z.object({
    productId: z.uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.url()).optional(),
  }),
};

export const deleteProduct = {
  params: z.object({
    productId: z.uuid(),
  }),
};
