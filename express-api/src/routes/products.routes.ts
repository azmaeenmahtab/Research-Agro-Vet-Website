import { Router } from 'express';
import {
  listProducts,
  getProductById,
  patchProduct,
  getProductReviews,
  createProductReview,
} from '../controllers/products.controller';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.patch('/:id', patchProduct);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', createProductReview);

export default router;

