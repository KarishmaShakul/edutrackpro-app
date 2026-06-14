import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    semester: { type: Number, required: true },
    // Evaluation components
    internal: {
      marks:    { type: Number, default: 0 },
      maxMarks: { type: Number, default: 40 },
    },
    external: {
      marks:    { type: Number, default: 0 },
      maxMarks: { type: Number, default: 60 },
    },
    assignment: {
      marks:    { type: Number, default: 0 },
      maxMarks: { type: Number, default: 20 },
    },
    // Computed
    totalMarks:  { type: Number, default: 0 },
    percentage:  { type: Number, default: 0 },
    grade: {
      type: String,
      enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'I'],
      default: 'I', // I = Incomplete
    },
    gradePoints: { type: Number, default: 0 },
    remarks:     { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One grade record per student per course
gradeSchema.index({ student: 1, course: 1 }, { unique: true });

// Auto-compute grade before save
gradeSchema.pre('save', function (next) {
  const total = this.internal.marks + this.external.marks + this.assignment.marks;
  const max   = this.internal.maxMarks + this.external.maxMarks + this.assignment.maxMarks;
  this.totalMarks = total;
  this.percentage = max > 0 ? Math.round((total / max) * 100) : 0;

  const p = this.percentage;
  if      (p >= 90) { this.grade = 'O';  this.gradePoints = 10; }
  else if (p >= 80) { this.grade = 'A+'; this.gradePoints = 9;  }
  else if (p >= 70) { this.grade = 'A';  this.gradePoints = 8;  }
  else if (p >= 60) { this.grade = 'B+'; this.gradePoints = 7;  }
  else if (p >= 50) { this.grade = 'B';  this.gradePoints = 6;  }
  else if (p >= 40) { this.grade = 'C';  this.gradePoints = 5;  }
  else if (p  >  0) { this.grade = 'F';  this.gradePoints = 0;  }
  else              { this.grade = 'I';  this.gradePoints = 0;  }

  next();
});

export const Grade = mongoose.model('Grade', gradeSchema);