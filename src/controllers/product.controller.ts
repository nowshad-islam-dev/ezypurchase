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
  const filter = { name: req.query.name as string };
  const options = {
    sortBy: req.query.sortBy as string,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
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
  updateProduct,
  deleteProduct,
};
