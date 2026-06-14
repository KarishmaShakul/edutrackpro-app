import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    type:      { type: String, enum: ['pdf', 'video', 'link', 'other'], default: 'pdf' },
    url:       { type: String, required: true },
    publicId:  { type: String, default: '' },
    uploadedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    dueDate:     { type: Date, required: true },
    maxMarks:    { type: Number, default: 100 },
    attachments: [{ url: String, publicId: String, name: String }],
    submissions: [
      {
        student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fileUrl:     String,
        publicId:    String,
        submittedAt: { type: Date, default: Date.now },
        marks:       { type: Number, default: null },
        feedback:    { type: String, default: '' },
        status:      { type: String, enum: ['submitted', 'late', 'graded'], default: 'submitted' },
      },
    ],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    semester:    { type: Number, required: true },
    section:     { type: String, default: '' },
    credits:     { type: Number, default: 3 },
    materials:   [materialSchema],
    assignments: [assignmentSchema],
    isActive:    { type: Boolean, default: true },
    schedule: [
      {
        day:       { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat'] },
        startTime: String,
        endTime:   String,
        room:      String,
      },
    ],
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);