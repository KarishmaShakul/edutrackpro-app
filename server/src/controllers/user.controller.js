
import { sendWelcomeEmail } from '../services/email.service.js';
import { User }             from '../models/index.js';
import { Department }       from '../models/index.js';
import { ApiError }         from '../utils/ApiError.js';
import { ApiResponse }      from '../utils/ApiResponse.js';

export const getAllUsers = async (req, res) => {
  const { role, department, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role)       filter.role = role;
  if (department) filter.department = department;
  if (search) {
    filter.$or = [
      { name:       { $regex: search, $options: 'i' } },
      { email:      { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  res.status(200).json(new ApiResponse(200, { users, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } }, 'Users fetched'));
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name code');
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json(new ApiResponse(200, user, 'User fetched'));
};

export const createUser = async (req, res) => {
  const { name, email, password, role, department, rollNumber, semester, section, designation, qualification, phone } = req.body;
  if (!name || !email || !password || !role) throw new ApiError(400, 'Name, email, password and role are required');
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already registered');
  if (role === 'hod' && department) {
    const dept = await Department.findById(department);
    if (!dept) throw new ApiError(404, 'Department not found');
    if (dept.hod) throw new ApiError(400, 'Department already has a HOD.');
  }
  const plainPassword = password;
  const user = await User.create({ name, email, password, role, department: department || null, rollNumber: rollNumber || '', semester: semester || 1, section: section || '', designation: designation || '', qualification: qualification || '', phone: phone || '' });
  if (role === 'hod' && department) {
    await Department.findByIdAndUpdate(department, { hod: user._id });
  }
  try { await sendWelcomeEmail(user, plainPassword); } catch (err) { console.error('Welcome email failed:', err.message); }
  res.status(201).json(new ApiResponse(201, user, 'User created successfully'));
};

export const updateUser = async (req, res) => {
  const { name, phone, designation, qualification, semester, section, rollNumber, isActive, department } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) throw new ApiError(403, 'Not authorized');
  if (user.role === 'hod' && department && department !== user.department?.toString()) {
    if (user.department) await Department.findByIdAndUpdate(user.department, { hod: null });
    await Department.findByIdAndUpdate(department, { hod: user._id });
  }
  if (name)          user.name          = name;
  if (phone)         user.phone         = phone;
  if (designation)   user.designation   = designation;
  if (qualification) user.qualification = qualification;
  if (semester)      user.semester      = semester;
  if (section)       user.section       = section;
  if (rollNumber)    user.rollNumber    = rollNumber;
  if (department)    user.department    = department;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  await user.save({ validateBeforeSave: false });
  const updated = await User.findById(user._id).populate('department', 'name code');
  res.status(200).json(new ApiResponse(200, updated, 'User updated successfully'));
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'hod' && user.department) {
    await Department.findByIdAndUpdate(user.department, { hod: null });
  }
  await user.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
};

export const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`));
};

export const getUsersByDepartment = async (req, res) => {
  const deptId = req.params.deptId;
  if (req.user.role === 'hod' && req.user.department?.toString() !== deptId) throw new ApiError(403, 'Access denied');
  const teachers = await User.find({ department: deptId, role: 'teacher', isActive: true }).select('name email designation avatar phone');
  const students = await User.find({ department: deptId, role: 'student', isActive: true }).select('name email rollNumber semester section avatar');
  res.status(200).json(new ApiResponse(200, { teachers, students }, 'Department users fetched'));
};

export const getNotifications = async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  const unread = user.notifications.filter(n => !n.isRead).sort((a, b) => b.createdAt - a.createdAt);
  res.status(200).json(new ApiResponse(200, unread, 'Notifications fetched'));
};

export const markNotificationRead = async (req, res) => {
  const { notifId } = req.params;
  await User.updateOne({ _id: req.user._id, 'notifications._id': notifId }, { $set: { 'notifications.$.isRead': true } });
  res.status(200).json(new ApiResponse(200, null, 'Notification marked as read'));
};
