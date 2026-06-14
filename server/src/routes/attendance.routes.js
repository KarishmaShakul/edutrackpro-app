import { Router } from 'express';
import {
  markAttendance, getCourseAttendance,
  getStudentAttendance, getSessionAttendance, editAttendance,
} from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.post('/',                       authorize('teacher'),             markAttendance);
router.get ('/course/:courseId',       authorize('admin','hod','teacher'),getCourseAttendance);
router.get ('/student/:studentId',                                       getStudentAttendance);
router.get ('/session/:sessionId',                                       getSessionAttendance);
router.patch('/session/:sessionId',    authorize('admin','teacher'),     editAttendance);

export default router;