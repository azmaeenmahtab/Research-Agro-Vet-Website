import { Router } from 'express';
import { getUniversalDiscount } from '../controllers/admin/discounts.controller';

const router = Router();

// Public route to fetch current active universal discount
router.get('/universal', getUniversalDiscount);

export default router;

