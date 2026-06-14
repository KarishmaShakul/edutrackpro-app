import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';
import { User }        from '../models/index.js';
import { Course }      from '../models/index.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ─── Upload avatar ────────────────────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const user = await User.findById(req.user._id);

  // Delete old avatar if exists
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image');

  user.avatar = { url: result.secure_url, publicId: result.public_id };
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, { avatar: user.avatar }, 'Avatar updated successfully')
  );
};

// ─── Upload course material ───────────────────────────────────────────────────
export const uploadMaterial = async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const { courseId, title, type } = req.body;
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');

  if (course.teacher.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the course teacher can upload materials');
  }

  const resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'raw';
  const result = await uploadToCloudinary(req.file.buffer, 'materials', resourceType);

  course.materials.push({
    title:      title || req.file.originalname,
    type:       type  || 'pdf',
    url:        result.secure_url,
    publicId:   result.public_id,
    uploadedBy: req.user._id,
  });
  await course.save();

  res.status(201).json(
    new ApiResponse(201, course.materials, 'Material uploaded successfully')
  );
};