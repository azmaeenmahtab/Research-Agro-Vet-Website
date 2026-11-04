import { Router } from 'express';
import productsRoutes from './products.routes';
import ordersRoutes from './orders.routes';
import discountsRoutes from './discounts.routes';
import adminRoutes from './admin';

const router = Router();

// Public routes
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/discounts', discountsRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export default router;

