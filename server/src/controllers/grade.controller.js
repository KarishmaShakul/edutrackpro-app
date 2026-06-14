
import { Grade }       from '../models/index.js';
import { Course }      from '../models/index.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { io }          from '../index.js';
import { sendGradePublishedEmails } from '../services/email.service.js';

export const upsertGrade = async (req, res) => {
  const { studentId, courseId, internal, external, assignment, remarks } = req.body;
  if (!studentId || !courseId) throw new ApiError(400, 'studentId and courseId are required');
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new ApiError(403, 'Only the course teacher can enter grades');
  const grade = await Grade.findOneAndUpdate(
    { student: studentId, course: courseId },
    { teacher: req.user._id, semester: course.semester, internal: internal || { marks: 0, maxMarks: 40 }, external: external || { marks: 0, maxMarks: 60 }, assignment: assignment || { marks: 0, maxMarks: 20 }, remarks: remarks || '' },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(200).json(new ApiResponse(200, grade, 'Grade saved'));
};

export const publishGrades = async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');
  if (course.teacher.toString() !== req.user._id.toString()) throw new ApiError(403, 'Only the course teacher can publish grades');
  const grades = await Grade.find({ course: courseId, isPublished: false });
  if (!grades.length) throw new ApiError(400, 'No unpublished grades found');
  await Grade.updateMany({ course: courseId, isPublished: false }, { isPublished: true, publishedAt: new Date() });
  grades.forEach(grade => {
    io.to(`user:${grade.student}`).emit('grade:published', { courseId, courseName: course.name, message: `Your grades for ${course.name} have been published` });
  });
  const publishedGrades = await Grade.find({ course: courseId }).populate('course', 'name');
  try { await sendGradePublishedEmails(publishedGrades); } catch (err) { console.error('Grade email failed:', err.message); }
  res.status(200).json(new ApiResponse(200, { published: grades.length }, 'Grades published successfully'));
};

export const getCourseGrades = async (req, res) => {
  const { courseId } = req.params;
  const grades = await Grade.find({ course: courseId }).populate('student', 'name rollNumber avatar section').sort({ createdAt: 1 });
  res.status(200).json(new ApiResponse(200, grades, 'Course grades fetched'));
};

export const getStudentGrades = async (req, res) => {
  const { studentId } = req.params;
  if (req.user.role === 'student' && req.user._id.toString() !== studentId) throw new ApiError(403, 'Access denied');
  const filter = { student: studentId };
  if (req.user.role === 'student') filter.isPublished = true;
  const grades = await Grade.find(filter).populate('course', 'name code credits semester').sort({ createdAt: -1 });
  const published    = grades.filter(g => g.isPublished);
  const totalCredits = published.reduce((sum, g) => sum + (g.course?.credits || 3), 0);
  const weightedGP   = published.reduce((sum, g) => sum + g.gradePoints * (g.course?.credits || 3), 0);
  const cgpa         = totalCredits > 0 ? (weightedGP / totalCredits).toFixed(2) : '0.00';
  res.status(200).json(new ApiResponse(200, { grades, cgpa }, 'Student grades fetched'));
};

export const getDeptGradeReport = async (req, res) => {
  const deptId = req.user.department;
  if (!deptId) throw new ApiError(400, 'No department assigned');
  const courses    = await Course.find({ department: deptId }).select('_id name code');
  const courseIds  = courses.map(c => c._id);
  const grades     = await Grade.find({ course: { $in: courseIds }, isPublished: true }).populate('student', 'name rollNumber').populate('course', 'name code credits');
  const report = courses.map(course => {
    const courseGrades = grades.filter(g => g.course._id.toString() === course._id.toString());
    const avg    = courseGrades.length ? (courseGrades.reduce((s, g) => s + g.percentage, 0) / courseGrades.length).toFixed(1) : 0;
    const passed = courseGrades.filter(g => g.grade !== 'F' && g.grade !== 'I').length;
    const failed = courseGrades.filter(g => g.grade === 'F').length;
    return { course, totalStudents: courseGrades.length, avg, passed, failed };
  });
  res.status(200).json(new ApiResponse(200, report, 'Department grade report fetched'));
};
