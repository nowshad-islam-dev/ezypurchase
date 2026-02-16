import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { productService } from '../services/product.service';
import { ApiError } from '../utils/apiError';

const createProduct = async (req: Request, res: Response) => {
  if (res.locals.fileUrls && Array.isArray(res.locals.fileUrls)) {
    req.body['images'] = res.locals.fileUrls;
  }
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(product);
};

const getProducts = async (req: Request, res: Response) => {
  const filter = { slug: req.validated.product as string };
  const options = {
    sortBy: req.validated.sortBy as string,
    limit: req.validated.limit
      ? parseInt(req.validated.limit as string, 10)
      : 10,
    page: req.validated.page ? parseInt(req.validated.page as string, 10) : 1,
  };
  const result = await productService.queryProducts(filter, options);
  res.send(result);
};

const getProduct = async (req: Request, res: Response) => {
  const product = await productService.getProductById(
    req.params.productId as string,
  );
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
};

const getProductsByCategory = async (req: Request, res: Response) => {
  const categorySlug = req.validated.category as string;
  const options = {
    sortBy: req.validated.sortBy as string,
    limit: req.validated.limit
      ? parseInt(req.validated.limit as string, 10)
      : 10,
    page: req.validated.page ? parseInt(req.validated.page as string, 10) : 1,
  };
  const result = await productService.getProductsByCategory(
    categorySlug,
    options,
  );
  res.send(result);
};

const updateProduct = async (req: Request, res: Response) => {
  const product = await productService.updateProductById(
    req.params.productId as string,
    req.body,
  );
  res.send(product);
};

const deleteProduct = async (req: Request, res: Response) => {
  await productService.deleteProductById(req.params.productId as string);
  res.status(httpStatus.NO_CONTENT).send();
};

export const productController = {
  createProduct,
  getProducts,
  getProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
};
