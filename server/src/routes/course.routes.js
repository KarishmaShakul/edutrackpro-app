import { Router } from 'express';
import {
  getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  enrollStudents, removeStudent, selfEnroll,
  addMaterial, deleteMaterial,
  addAssignment, submitAssignment,
} from '../controllers/course.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.get ('/',                                              getAllCourses);
router.post('/',          authorize('admin','hod'),          createCourse);
router.get ('/:id',                                          getCourseById);
router.patch('/:id',      authorize('admin','hod','teacher'),updateCourse);
router.delete('/:id',     authorize('admin','hod'),          deleteCourse);

router.post('/:id/enroll',         authorize('admin','hod'), enrollStudents);
router.post('/:id/self-enroll',    authorize('student'),     selfEnroll);
router.delete('/:id/students/:studentId', authorize('admin','hod'), removeStudent);

router.post  ('/:id/materials',    authorize('admin','teacher'), addMaterial);
router.delete('/:id/materials/:materialId', authorize('admin','teacher'), deleteMaterial);

router.post('/:id/assignments',    authorize('teacher'),     addAssignment);
router.post('/:id/assignments/:assignmentId/submit',
                                   authorize('student'),     submitAssignment);

export default router;