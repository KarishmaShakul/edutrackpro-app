import { sendEmail }        from '../config/nodemailer.js';
import { User }             from '../models/index.js';
import {
  welcomeEmail,
  gradePublishedEmail,
  attendanceWarningEmail,
  assignmentPostedEmail,
  announcementEmail,
} from '../utils/emailTemplates.js';

export const sendWelcomeEmail = async (user, plainPassword) => {
  const template = welcomeEmail({
    name:     user.name,
    email:    user.email,
    password: plainPassword,
    role:     user.role,
  });
  await sendEmail({ to: user.email, ...template });
};

export const sendGradePublishedEmails = async (grades) => {
  for (const grade of grades) {
    const student = await User.findById(grade.student).select('name email');
    if (!student) continue;
    const template = gradePublishedEmail({
      name:       student.name,
      courseName: grade.course?.name || 'your course',
      grade:      grade.grade,
      percentage: grade.percentage,
    });
    await sendEmail({ to: student.email, ...template });
  }
};

export const sendAttendanceWarningEmail = async (studentId, courseName, percentage) => {
  const student = await User.findById(studentId).select('name email');
  if (!student) return;
  if (percentage < 75) {
    const template = attendanceWarningEmail({
      name: student.name, courseName, percentage,
    });
    await sendEmail({ to: student.email, ...template });
  }
};

export const sendAssignmentEmails = async (students, courseName, title, dueDate) => {
  for (const studentId of students) {
    const student = await User.findById(studentId).select('name email');
    if (!student) continue;
    const template = assignmentPostedEmail({
      name: student.name, courseName, title, dueDate,
    });
    await sendEmail({ to: student.email, ...template });
  }
};

export const sendAnnouncementEmails = async (userIds, title, message) => {
  for (const userId of userIds) {
    const user = await User.findById(userId).select('name email');
    if (!user) continue;
    const template = announcementEmail({ name: user.name, title, message });
    await sendEmail({ to: user.email, ...template });
  }
};