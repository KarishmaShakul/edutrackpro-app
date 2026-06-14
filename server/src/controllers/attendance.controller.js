import { Attendance }  from '../models/index.js';
import { Course }      from '../models/index.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { io }          from '../index.js';
import { sendAttendanceWarningEmail } from '../services/email.service.js';

export const markAttendance = async (req, res) => {
  const { courseId, date, topic, records } = req.body;
  if (!courseId || !date || !records?.length) throw new ApiError(400, 'courseId, date and records are required');
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.teacher.toString() !== req.user._id.toString()) throw new ApiError(403, 'Only the course teacher can mark attendance');
  const attendance = await Attendance.findOneAndUpdate(
    { course: courseId, date: new Date(date) },
    { teacher: req.user._id, topic: topic || '', records },
    { upsert: true, new: true }
  );
  for (const record of records) {
    if (record.status === 'absent') {
      io.to(`user:${record.student}`).emit('attendance:marked', { courseId, courseName: course.name, date, status: 'absent', message: `You were marked absent in ${course.name}` });
      const pct = await Attendance.getStudentPercentage(courseId, record.student);
      if (pct < 75) {
        try { await sendAttendanceWarningEmail(record.student, course.name, pct); } catch (err) { console.error('Attendance email failed:', err.message); }
      }
    }
  }
  res.status(200).json(new ApiResponse(200, attendance, 'Attendance marked successfully'));
};

export const getCourseAttendance = async (req, res) => {
  const { courseId } = req.params;
  const { from, to } = req.query;
  const filter = { course: courseId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to)   filter.date.$lte = new Date(to);
  }
  const records = await Attendance.find(filter).populate('records.student', 'name rollNumber avatar').sort({ date: -1 });
  res.status(200).json(new ApiResponse(200, records, 'Attendance fetched'));
};

export const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params;
  if (req.user.role === 'student' && req.user._id.toString() !== studentId) throw new ApiError(403, 'Access denied');
  const courses = await Course.find({ students: studentId, isActive: true }).select('name code');
  const summary = await Promise.all(courses.map(async (course) => {
    const percentage = await Attendance.getStudentPercentage(course._id, studentId);
    const total      = await Attendance.countDocuments({ course: course._id });
    const present    = Math.round((percentage / 100) * total);
    return { course: { _id: course._id, name: course.name, code: course.code }, total, present, absent: total - present, percentage, status: percentage >= 75 ? 'safe' : percentage >= 60 ? 'warning' : 'danger' };
  }));
  res.status(200).json(new ApiResponse(200, summary, 'Student attendance summary fetched'));
};

export const getSessionAttendance = async (req, res) => {
  const session = await Attendance.findById(req.params.sessionId).populate('records.student', 'name rollNumber avatar section');
  if (!session) throw new ApiError(404, 'Session not found');
  res.status(200).json(new ApiResponse(200, session, 'Session fetched'));
};

export const editAttendance = async (req, res) => {
  const { records, topic } = req.body;
  const session = await Attendance.findById(req.params.sessionId);
  if (!session) throw new ApiError(404, 'Session not found');
  if (session.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized');
  if (records) session.records = records;
  if (topic)   session.topic   = topic;
  await session.save();
  res.status(200).json(new ApiResponse(200, session, 'Attendance updated'));
};
