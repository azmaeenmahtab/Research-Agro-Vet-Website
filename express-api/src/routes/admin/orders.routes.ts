import { Router } from 'express';
import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrder,
  createManualOrder,
} from '../../controllers/admin/orders.controller';
import { requireAdmin } from '../../middleware/adminAuth';

const router = Router();

router.use(requireAdmin);

// IMPORTANT: /manual MUST be defined before /:id
router.post('/manual', createManualOrder);
router.get('/', getAdminOrders);
router.get('/:id', getAdminOrderById);
router.put('/:id', updateAdminOrder);

export default router;

