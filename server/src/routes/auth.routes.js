import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
  changePassword,
} from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register',        protect, authorize('admin'), register);
router.post('/login',           login);
router.post('/logout',          protect, logout);
router.post('/refresh-token',   refreshAccessToken);
router.get ('/me',              protect, getMe);
router.patch('/change-password',protect, changePassword);

export default router;