import { Router } from 'express';
import {
  getAdminProducts,
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
  deleteAdminProduct,
  updateAdminProductClinical,
} from '../../controllers/admin/products.controller';
import { requireAdmin } from '../../middleware/adminAuth';

const router = Router();

router.use(requireAdmin);

router.get('/', getAdminProducts);
router.post('/', createAdminProduct);
router.patch('/:id/clinical', updateAdminProductClinical);
router.get('/:id', getAdminProductById);
router.put('/:id', updateAdminProduct);
router.delete('/:id', deleteAdminProduct);

export default router;

