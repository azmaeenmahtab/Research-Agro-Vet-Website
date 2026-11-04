import { Router } from 'express';
import { updateAdminVariant } from '../../controllers/admin/variants.controller';
import { requireAdmin } from '../../middleware/adminAuth';

const router = Router();

router.use(requireAdmin);

router.patch('/:id', updateAdminVariant);

export default router;

