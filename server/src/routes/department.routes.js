import { Router } from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHOD,
} from '../controllers/department.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get  ('/',           getAllDepartments);
router.post ('/',           authorize('admin'),  createDepartment);
router.get  ('/:id',        getDepartmentById);
router.patch('/:id',        authorize('admin'),  updateDepartment);
router.delete('/:id',       authorize('admin'),  deleteDepartment);
router.patch('/:id/assign-hod', authorize('admin'), assignHOD);

export default router;