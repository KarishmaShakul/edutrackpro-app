import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendToken } from '../utils/sendToken.js';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt.js';

// ─── Register ────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  const { name, email, password, role, department, rollNumber, semester, section } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = await User.create({
    name, email, password, role,
    department: department || null,
    rollNumber:  rollNumber  || '',
    semester:    semester    || 1,
    section:     section     || '',
  });

  await sendToken(user, 201, res, 'Registration successful');
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account deactivated. Contact admin.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  await sendToken(user, 200, res, 'Login successful');
};

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });

  res
    .clearCookie('refreshToken')
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
};

// ─── Refresh Access Token ─────────────────────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const newAccessToken = generateAccessToken({
    _id:   user._id,
    role:  user.role,
    email: user.email,
  });

  res.status(200).json(
    new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed')
  );
};

// ─── Get current user ────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');
  res.status(200).json(new ApiResponse(200, user, 'User fetched'));
};

// ─── Change password ─────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Both fields are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
};