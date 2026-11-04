import { Router } from 'express';
import { uploadImages } from '../../controllers/admin/upload.controller';
import { upload } from '../../middleware/upload';
import { requireAdmin } from '../../middleware/adminAuth';

const router = Router();

router.use(requireAdmin);

// Accept either multiple 'files' or single 'file'
router.post('/', upload.any(), uploadImages);

export default router;

