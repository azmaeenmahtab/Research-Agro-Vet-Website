import { Router } from 'express';
import {
  getAdminCategories,
  createAdminCategory,
  getAdminCategoryById,
  updateAdminCategory,
  deleteAdminCategory,
} from '../../controllers/admin/categories.controller';
import { requireAdmin } from '../../middleware/adminAuth';

const router = Router();

router.use(requireAdmin);

router.get('/', getAdminCategories);
router.post('/', createAdminCategory);
router.get('/:id', getAdminCategoryById);
router.put('/:id', updateAdminCategory);
router.delete('/:id', deleteAdminCategory);

export default router;

