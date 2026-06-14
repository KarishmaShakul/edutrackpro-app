import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    topic:   { type: String, default: '' },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
          default: 'absent',
        },
        remark: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same course + date
attendanceSchema.index({ course: 1, date: 1 }, { unique: true });

// Static: get attendance % for a student in a course
attendanceSchema.statics.getStudentPercentage = async function (courseId, studentId) {
  const sessions = await this.find({ course: courseId });
  if (!sessions.length) return 0;

  let present = 0;
  sessions.forEach((session) => {
    const record = session.records.find(
      (r) => r.student.toString() === studentId.toString()
    );
    if (record && (record.status === 'present' || record.status === 'late')) {
      present++;
    }
  });
  return Math.round((present / sessions.length) * 100);
};

export const Attendance = mongoose.model('Attendance', attendanceSchema);