const base = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white;
                 border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #7C3AED, #1D4ED8);
              padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p  { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .body   { padding: 32px; }
    .body p { color: #374151; line-height: 1.6; font-size: 15px; }
    .highlight { background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .highlight p { margin: 6px 0; font-size: 14px; color: #6B7280; }
    .highlight span { color: #111827; font-weight: 600; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7C3AED, #1D4ED8);
           color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none;
           font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { padding: 24px 32px; border-top: 1px solid #E5E7EB; text-align: center; }
    .footer p { color: #9CA3AF; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 EduTrackPro</h1>
      <p>Learning Management System</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2026 EduTrackPro. This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>`;

export const welcomeEmail = ({ name, email, password, role }) => ({
  subject: `Welcome to EduTrackPro — Your ${role} account is ready`,
  html: base(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your <strong>${role}</strong> account has been created on EduTrackPro. Here are your login credentials:</p>
    <div class="highlight">
      <p>Email: <span>${email}</span></p>
      <p>Password: <span>${password}</span></p>
      <p>Role: <span style="text-transform:capitalize">${role}</span></p>
    </div>
    <p>Please login and change your password immediately.</p>
    <a href="${process.env.CLIENT_URL}/login" class="btn">Login to EduTrackPro →</a>
    <p style="color:#9CA3AF;font-size:13px">Keep your credentials safe and do not share them.</p>
  `),
});

export const gradePublishedEmail = ({ name, courseName, grade, percentage }) => ({
  subject: `Grades Published — ${courseName}`,
  html: base(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your grades for <strong>${courseName}</strong> have been published.</p>
    <div class="highlight">
      <p>Course: <span>${courseName}</span></p>
      <p>Grade: <span>${grade}</span></p>
      <p>Percentage: <span>${percentage}%</span></p>
    </div>
    <a href="${process.env.CLIENT_URL}/student/grades" class="btn">View Grade Card →</a>
  `),
});

export const attendanceWarningEmail = ({ name, courseName, percentage }) => ({
  subject: `⚠️ Attendance Warning — ${courseName}`,
  html: base(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your attendance in <strong>${courseName}</strong> has fallen below the required threshold.</p>
    <div class="highlight">
      <p>Course: <span>${courseName}</span></p>
      <p>Current Attendance: <span style="color:#EF4444">${percentage}%</span></p>
      <p>Required: <span>75%</span></p>
    </div>
    <p>Please contact your teacher or HOD immediately to avoid being detained.</p>
    <a href="${process.env.CLIENT_URL}/student/attendance" class="btn">View Attendance →</a>
  `),
});

export const assignmentPostedEmail = ({ name, courseName, title, dueDate }) => ({
  subject: `New Assignment — ${courseName}`,
  html: base(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>A new assignment has been posted in <strong>${courseName}</strong>.</p>
    <div class="highlight">
      <p>Assignment: <span>${title}</span></p>
      <p>Course: <span>${courseName}</span></p>
      <p>Due Date: <span>${new Date(dueDate).toDateString()}</span></p>
    </div>
    <a href="${process.env.CLIENT_URL}/student/courses" class="btn">View Assignment →</a>
  `),
});

export const announcementEmail = ({ name, title, message }) => ({
  subject: `📢 Announcement — ${title}`,
  html: base(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>A new announcement has been posted:</p>
    <div class="highlight">
      <p><strong>${title}</strong></p>
      <p style="color:#374151;margin-top:8px">${message}</p>
    </div>
    <a href="${process.env.CLIENT_URL}" class="btn">Open EduTrackPro →</a>
  `),
});