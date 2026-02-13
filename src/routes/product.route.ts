import express from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import { uploadArray } from '../middlewares/multer';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../validations/product.validation';
import { productController } from '../controllers/product.controller';
import { Role } from '../generated/prisma/enums';

const router = express.Router();

router
  .route('/')
  .post(
    auth(Role.ADMIN),
    uploadArray('image', 'product'),
    validate(createProduct),
    productController.createProduct,
  )
  .get(validate(getProducts), productController.getProducts);

router
  .route('/:productId')
  .get(validate(getProduct), productController.getProduct)
  .patch(
    auth(Role.ADMIN),
    validate(updateProduct),
    productController.updateProduct,
  )
  .delete(
    auth(Role.ADMIN),
    validate(deleteProduct),
    productController.deleteProduct,
  );

export default router;
