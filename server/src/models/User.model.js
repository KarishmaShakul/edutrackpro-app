import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'hod', 'teacher', 'student'],
      required: true,
    },
    avatar: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    // Teacher / HOD specific
    designation:  { type: String, default: '' },
    qualification: { type: String, default: '' },
    // Student specific
    rollNumber:   { type: String, default: '' },
    semester:     { type: Number, default: 1 },
    section:      { type: String, default: '' },
    // Shared
    phone:        { type: String, default: '' },
    isActive:     { type: Boolean, default: true },
    lastLogin:    { type: Date, default: null },
    refreshToken: { type: String, select: false },
    notifications: [
      {
        title:    String,
        message:  String,
        type:     { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
        isRead:   { type: Boolean, default: false },
        link:     { type: String, default: '' },
        createdAt:{ type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export const User = mongoose.model('User', userSchema);