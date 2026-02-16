import httpStatus from 'http-status';
import { Product } from '../generated/prisma/client';
import {
  ProductCreateInput,
  ProductUpdateInput,
  ProductWhereInput,
} from '../generated/prisma/models';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';

interface ProductCreateWithCategoryIdInput extends ProductCreateInput {
  categoryId: string;
}

const createProduct = async (
  productBody: ProductCreateWithCategoryIdInput,
): Promise<Product> => {
  const isSlugExists = await prisma.product.findUnique({
    where: { slug: productBody.slug },
  });
  const isCategoryExists = await prisma.category.findUnique({
    where: { id: productBody.categoryId },
  });

  if (isSlugExists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Generated slug: ${productBody.slug} already exists`,
    );
  }
  if (!isCategoryExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Provided category does not exist`,
    );
  }
  const { categoryId, ...rest } = productBody;

  return prisma.product.create({
    data: {
      ...rest,
      category: {
        connect: { id: categoryId },
      },
    },
  });
};

const queryProducts = async (
  filter: any,
  options: { limit?: number; page?: number; sortBy?: string },
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  // Simple filtering by product slug (contains)
  // if slug is not provided all products will be returned
  const where: ProductWhereInput = filter.slug
    ? { slug: { contains: filter.slug, mode: 'insensitive' } }
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

const getProductsByCategory = async (
  slug: string,
  options: { limit?: number; page?: number; sortBy?: string },
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const categories = await prisma.$queryRaw<
    { id: string }[]
  >`WITH RECURSIVE category_tree AS (
  SELECT id from "Category" WHERE slug=${slug}
   UNION ALL
    SELECT c.id
    FROM "Category" c
    JOIN category_tree ct ON c."parentId" = ct.id
  )SELECT id FROM category_tree;
`;
  if (categories.length === 0) {
    throw new ApiError(400, 'Category does not exists');
  }

  const categoryIds = categories.map((c) => c.id);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: { in: categoryIds } },
      skip,
      take: limit,
      orderBy: options.sortBy
        ? { [options.sortBy]: 'asc' }
        : { createdAt: 'desc' },
    }),
    prisma.product.count({ where: { categoryId: { in: categoryIds } } }),
  ]);

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
  getProductsByCategory,
  updateProductById,
  deleteProductById,
};
