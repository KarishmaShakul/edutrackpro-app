import { Router } from 'express';
import {
  upsertGrade, publishGrades,
  getCourseGrades, getStudentGrades, getDeptGradeReport,
} from '../controllers/grade.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.post  ('/',                      authorize('admin','teacher'),     upsertGrade);
router.post  ('/publish/:courseId',     authorize('teacher'),             publishGrades);
router.get   ('/course/:courseId',      authorize('admin','hod','teacher'),getCourseGrades);
router.get   ('/student/:studentId',                                      getStudentGrades);
router.get   ('/department/report',     authorize('hod'),                 getDeptGradeReport);

export default router;