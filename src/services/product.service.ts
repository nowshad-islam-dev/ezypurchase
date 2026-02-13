import httpStatus from 'http-status';
import { Product } from '../generated/prisma/client';
import {
  ProductCreateInput,
  ProductUpdateInput,
  ProductWhereInput,
} from '../generated/prisma/models';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';

const createProduct = async (
  productBody: ProductCreateInput,
): Promise<Product> => {
  return prisma.product.create({
    data: productBody,
  });
};

const queryProducts = async (
  filter: any,
  options: { limit?: number; page?: number; sortBy?: string },
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  // Simple filtering by product name (contains)
  const where: ProductWhereInput = filter.name
    ? { name: { contains: filter.name, mode: 'insensitive' } }
    : {};

  const products = await prisma.product.findMany({
    where,
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: 'asc' }
      : { createdAt: 'desc' },
  });

  const total = await prisma.product.count({ where });

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getProductById = async (id: string): Promise<Product | null> => {
  return prisma.product.findUnique({ where: { id } });
};

const updateProductById = async (
  productId: string,
  updateBody: ProductUpdateInput,
): Promise<Product> => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return prisma.product.update({
    where: { id: productId },
    data: updateBody,
  });
};

const deleteProductById = async (productId: string): Promise<Product> => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return prisma.product.delete({ where: { id: productId } });
};

export const productService = {
  createProduct,
  queryProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
