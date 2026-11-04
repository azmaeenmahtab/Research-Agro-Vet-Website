import { Router } from 'express';
import {
  getUniversalDiscount,
  updateUniversalDiscount,
} from '../../controllers/admin/discounts.controller';

const router = Router();

router.get('/universal', getUniversalDiscount);
router.put('/universal', updateUniversalDiscount);

export default router;

