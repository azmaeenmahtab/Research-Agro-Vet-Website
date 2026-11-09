import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth.middleware';
import ordersRoutes from './orders.routes';
import productsRoutes from './products.routes';
import categoriesRoutes from './categories.routes';
import variantsRoutes from './variants.routes';
import uploadRoutes from './upload.routes';
import discountsRoutes from './discounts.routes';

const router = Router();

// Apply requireAdmin verification to all admin endpoints
router.use(requireAdmin);

/**
 * Target Protected Endpoint: /api/admin/dashboard
 * Returns verified admin user and session details extracted by Better Auth
 */
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Protected Admin Dashboard API',
    admin: {
      id: req.user?.id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
    session: {
      id: req.session?.id,
      expiresAt: req.session?.expiresAt,
    },
    timestamp: new Date().toISOString(),
  });
});

router.use('/orders', ordersRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/variants', variantsRoutes);
router.use('/upload', uploadRoutes);
router.use('/discounts', discountsRoutes);

export default router;

