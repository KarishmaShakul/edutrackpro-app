import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByDepartment,
  toggleUserStatus,
  getNotifications,
  markNotificationRead,
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect); // all user routes require auth

router.get  ('/',                     authorize('admin'),            getAllUsers);
router.post ('/',                     authorize('admin'),            createUser);
router.get  ('/notifications',                                       getNotifications);
router.patch('/notifications/:notifId/read',                         markNotificationRead);
router.get  ('/department/:deptId',   authorize('admin', 'hod'),    getUsersByDepartment);
router.get  ('/:id',                  authorize('admin', 'hod'),    getUserById);
router.patch('/:id',                                                 updateUser);
router.delete('/:id',                 authorize('admin'),            deleteUser);
router.patch('/:id/toggle-status',    authorize('admin'),            toggleUserStatus);

export default router;