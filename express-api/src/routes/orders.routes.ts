import { Router } from 'express';
import {
  createOrder,
  lookupCustomer,
  getOrderByNumber,
} from '../controllers/orders.controller';

const router = Router();

router.post('/', createOrder);
// IMPORTANT: /lookup MUST be defined before /:orderNumber
router.get('/lookup', lookupCustomer);
router.get('/:orderNumber', getOrderByNumber);

export default router;

