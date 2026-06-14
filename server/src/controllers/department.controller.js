import { Department } from '../models/index.js';
import { User }       from '../models/index.js';
import { ApiError }   from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ─── Get all departments ──────────────────────────────────────────────────────
export const getAllDepartments = async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .populate('hod', 'name email avatar')
    .sort({ name: 1 });

  // Attach teacher + student counts
  const result = await Promise.all(
    departments.map(async (dept) => {
      const teacherCount = await User.countDocuments({ department: dept._id, role: 'teacher', isActive: true });
      const studentCount = await User.countDocuments({ department: dept._id, role: 'student', isActive: true });
      return { ...dept.toObject(), teacherCount, studentCount };
    })
  );

  res.status(200).json(new ApiResponse(200, result, 'Departments fetched'));
};

// ─── Get single department ────────────────────────────────────────────────────
export const getDepartmentById = async (req, res) => {
  const dept = await Department.findById(req.params.id)
    .populate('hod', 'name email avatar designation');
  if (!dept) throw new ApiError(404, 'Department not found');

  const teacherCount = await User.countDocuments({ department: dept._id, role: 'teacher' });
  const studentCount = await User.countDocuments({ department: dept._id, role: 'student' });

  res.status(200).json(
    new ApiResponse(200, { ...dept.toObject(), teacherCount, studentCount }, 'Department fetched')
  );
};

// ─── Create department (admin only) ───────────────────────────────────────────
export const createDepartment = async (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) throw new ApiError(400, 'Name and code are required');

  const exists = await Department.findOne({ $or: [{ name }, { code }] });
  if (exists) throw new ApiError(409, 'Department name or code already exists');

  const dept = await Department.create({ name, code, description });
  res.status(201).json(new ApiResponse(201, dept, 'Department created successfully'));
};

// ─── Update department (admin only) ───────────────────────────────────────────
export const updateDepartment = async (req, res) => {
  const { name, code, description, isActive } = req.body;

  const dept = await Department.findById(req.params.id);
  if (!dept) throw new ApiError(404, 'Department not found');

  if (name)        dept.name        = name;
  if (code)        dept.code        = code;
  if (description) dept.description = description;
  if (typeof isActive === 'boolean') dept.isActive = isActive;

  await dept.save();
  res.status(200).json(new ApiResponse(200, dept, 'Department updated successfully'));
};

// ─── Delete department (admin only) ───────────────────────────────────────────
export const deleteDepartment = async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) throw new ApiError(404, 'Department not found');

  const hasUsers = await User.exists({ department: dept._id });
  if (hasUsers) {
    throw new ApiError(400, 'Cannot delete department with existing users. Reassign users first.');
  }

  await dept.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Department deleted successfully'));
};

// ─── Assign HOD to department (admin only) ────────────────────────────────────
export const assignHOD = async (req, res) => {
  const { hodId } = req.body;
  const dept = await Department.findById(req.params.id);
  if (!dept) throw new ApiError(404, 'Department not found');

  const hod = await User.findById(hodId);
  if (!hod || hod.role !== 'hod') throw new ApiError(400, 'User is not a HOD');

  // Unassign previous HOD from this dept
  if (dept.hod) {
    await User.findByIdAndUpdate(dept.hod, { department: null });
  }

  dept.hod         = hodId;
  hod.department   = dept._id;
  await Promise.all([dept.save(), hod.save({ validateBeforeSave: false })]);

  res.status(200).json(new ApiResponse(200, dept, 'HOD assigned successfully'));
};