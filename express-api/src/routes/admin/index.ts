import { Router } from 'express';
import ordersRoutes from './orders.routes';
import productsRoutes from './products.routes';
import categoriesRoutes from './categories.routes';
import variantsRoutes from './variants.routes';
import uploadRoutes from './upload.routes';
import discountsRoutes from './discounts.routes';

const router = Router();

router.use('/orders', ordersRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/variants', variantsRoutes);
router.use('/upload', uploadRoutes);
router.use('/discounts', discountsRoutes);

export default router;

