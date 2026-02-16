import { z } from 'zod';

export const createProduct = {
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    slug: z.string().min(1).slugify(),
    categoryId: z.uuid(),
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
    product: z.string().slugify().optional(),
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

export const getProductsByCategory = {
  query: z.object({
    category: z.string().slugify(),
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
