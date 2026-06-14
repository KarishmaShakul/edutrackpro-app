import { Router }        from 'express';
import { uploadAvatar, uploadMaterial } from '../controllers/upload.controller.js';
import { protect }       from '../middleware/auth.middleware.js';
import { upload }        from '../config/multer.js';

const router = Router();
router.use(protect);

router.post('/avatar',   upload.single('avatar'),   uploadAvatar);
router.post('/material', upload.single('material'),  uploadMaterial);

export default router;