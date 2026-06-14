import { Course }      from '../models/index.js';
import { User }        from '../models/index.js';
import { ApiError }    from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { io }          from '../index.js';

// ─── Get all courses ──────────────────────────────────────────────────────────
export const getAllCourses = async (req, res) => {
  const { department, teacher, semester, search, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };
  if (department) filter.department = department;
  if (teacher)    filter.teacher    = teacher;
  if (semester)   filter.semester   = Number(semester);
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  // Teachers see only their own courses
  if (req.user.role === 'teacher') filter.teacher = req.user._id;

  // Students see only enrolled courses (unless browsing available)
  if (req.user.role === 'student') {
    if (req.query.available === 'true') {
      if (!req.user.department) {
        return res.status(200).json(
          new ApiResponse(200, { courses: [], pagination: { total: 0, page: 1, limit: Number(limit), pages: 0 } }, 'No department assigned')
        );
      }
      filter.department = req.user.department;
      filter.students = { $ne: req.user._id };
    } else {
      filter.students = req.user._id;
    }
  }

  // HOD sees only their department
  if (req.user.role === 'hod') filter.department = req.user.department;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments(filter);

  const includeCounts = req.user.role === 'student' && req.query.available !== 'true';
  let query = Course.find(filter)
    .populate('teacher',    'name email avatar designation')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  if (!includeCounts) {
    query = query.select('-materials -assignments');
  }

  const coursesRaw = await query;
  const courses = coursesRaw.map((c) => {
    const obj = c.toObject();
    if (includeCounts) {
      return {
        ...obj,
        materialCount:   obj.materials?.length   || 0,
        assignmentCount: obj.assignments?.length || 0,
        materials:   undefined,
        assignments: undefined,
      };
    }
    return obj;
  });

  res.status(200).json(
    new ApiResponse(200, {
      courses,
      pagination: { total, page: Number(page), limit: Number(limit),
        pages: Math.ceil(total / Number(limit)) },
    }, 'Courses fetched')
  );
};

// ─── Get single course (full detail) ─────────────────────────────────────────
export const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher',    'name email avatar designation')
    .populate('department', 'name code')
    .populate('students',   'name email rollNumber avatar semester section');

  if (!course) throw new ApiError(404, 'Course not found');

  // Students can only view courses they are enrolled in
  if (req.user.role === 'student' &&
      !course.students.some(s => s._id.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not enrolled in this course');
  }

  res.status(200).json(new ApiResponse(200, course, 'Course fetched'));
};

// ─── Create course (admin / HOD) ──────────────────────────────────────────────
export const createCourse = async (req, res) => {
  const { name, code, description, department, teacher, semester, section, credits, schedule } = req.body;

  if (!name || !code || !department || !teacher || !semester) {
    throw new ApiError(400, 'Name, code, department, teacher and semester are required');
  }

  const exists = await Course.findOne({ code });
  if (exists) throw new ApiError(409, 'Course code already exists');

  const teacherUser = await User.findById(teacher);
  if (!teacherUser || teacherUser.role !== 'teacher') {
    throw new ApiError(400, 'Assigned user is not a teacher');
  }

  const course = await Course.create({
    name, code, description, department,
    teacher, semester, section, credits, schedule,
  });

  res.status(201).json(new ApiResponse(201, course, 'Course created successfully'));
};

// ─── Update course ────────────────────────────────────────────────────────────
export const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  if (req.user.role === 'teacher' &&
      course.teacher.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this course');
  }

  const allowed = ['name', 'description', 'schedule', 'credits', 'section', 'isActive'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  await course.save();
  res.status(200).json(new ApiResponse(200, course, 'Course updated'));
};

// ─── Enroll students ──────────────────────────────────────────────────────────
export const enrollStudents = async (req, res) => {
  const { studentIds } = req.body;
  if (!studentIds?.length) throw new ApiError(400, 'studentIds array is required');

  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  const newStudents = studentIds.filter(
    id => !course.students.map(s => s.toString()).includes(id)
  );
  course.students.push(...newStudents);
  await course.save();

  // Notify newly enrolled students via socket
  newStudents.forEach(studentId => {
    io.to(`user:${studentId}`).emit('enrolled', {
      courseId:   course._id,
      courseName: course.name,
      message:    `You have been enrolled in ${course.name}`,
    });
  });

  res.status(200).json(
    new ApiResponse(200, { enrolled: newStudents.length }, 'Students enrolled successfully')
  );
};

// ─── Remove student from course ───────────────────────────────────────────────
export const removeStudent = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  course.students = course.students.filter(
    s => s.toString() !== req.params.studentId
  );
  await course.save();
  res.status(200).json(new ApiResponse(200, null, 'Student removed from course'));
};

// ─── Add material ─────────────────────────────────────────────────────────────
export const addMaterial = async (req, res) => {
  const { title, type, url } = req.body;
  if (!title || !url) throw new ApiError(400, 'Title and URL are required');

  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  if (course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the course teacher can add materials');
  }

  course.materials.push({ title, type, url, uploadedBy: req.user._id });
  await course.save();

  // Notify all enrolled students
  course.students.forEach(studentId => {
    io.to(`user:${studentId}`).emit('new:material', {
      courseId:   course._id,
      courseName: course.name,
      title,
      message:    `New material added in ${course.name}: ${title}`,
    });
  });

  res.status(201).json(new ApiResponse(201, course.materials, 'Material added'));
};

// ─── Delete material ──────────────────────────────────────────────────────────
export const deleteMaterial = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  course.materials = course.materials.filter(
    m => m._id.toString() !== req.params.materialId
  );
  await course.save();
  res.status(200).json(new ApiResponse(200, null, 'Material deleted'));
};

// ─── Add assignment ───────────────────────────────────────────────────────────
export const addAssignment = async (req, res) => {
  const { title, description, dueDate, maxMarks } = req.body;
  if (!title || !dueDate) throw new ApiError(400, 'Title and due date are required');

  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  if (course.teacher.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the course teacher can add assignments');
  }

  course.assignments.push({ title, description, dueDate, maxMarks, isPublished: true });
  await course.save();

  const assignment = course.assignments[course.assignments.length - 1];

  // Notify all enrolled students
  course.students.forEach(studentId => {
    io.to(`user:${studentId}`).emit('new:assignment', {
      courseId:       course._id,
      courseName:     course.name,
      assignmentId:   assignment._id,
      title,
      dueDate,
      message: `New assignment in ${course.name}: ${title} (due ${new Date(dueDate).toDateString()})`,
    });
  });

  res.status(201).json(new ApiResponse(201, assignment, 'Assignment added'));
};

// ─── Submit assignment (student) ──────────────────────────────────────────────
export const submitAssignment = async (req, res) => {
  const { fileUrl } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  const assignment = course.assignments.id(req.params.assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  const alreadySubmitted = assignment.submissions.find(
    s => s.student.toString() === req.user._id.toString()
  );
  if (alreadySubmitted) throw new ApiError(409, 'Already submitted');

  const isLate   = new Date() > new Date(assignment.dueDate);
  assignment.submissions.push({
    student:  req.user._id,
    fileUrl:  fileUrl || '',
    status:   isLate ? 'late' : 'submitted',
  });
  await course.save();

  res.status(201).json(new ApiResponse(201, null, `Assignment ${isLate ? 'submitted late' : 'submitted'} successfully`));
};

// ─── Delete course (soft delete) ─────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');

  if (req.user.role === 'hod' && course.department.toString() !== req.user.department?.toString()) {
    throw new ApiError(403, 'Not authorized to delete this course');
  }

  course.isActive = false;
  await course.save();

  res.status(200).json(new ApiResponse(200, null, 'Course deleted successfully'));
};

// ─── Student self-enroll ─────────────────────────────────────────────────────
export const selfEnroll = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');
  if (!course.isActive) throw new ApiError(400, 'Course is not available');

  if (!req.user.department) {
    throw new ApiError(400, 'Your account has no department assigned. Contact admin.');
  }

  if (course.department.toString() !== req.user.department.toString()) {
    throw new ApiError(403, 'You can only enroll in courses from your department');
  }

  const alreadyEnrolled = course.students.some(
    s => s.toString() === req.user._id.toString()
  );
  if (alreadyEnrolled) throw new ApiError(409, 'Already enrolled in this course');

  course.students.push(req.user._id);
  await course.save();

  io.to(`user:${req.user._id}`).emit('enrolled', {
    courseId:   course._id,
    courseName: course.name,
    message:    `You have been enrolled in ${course.name}`,
  });

  res.status(200).json(new ApiResponse(200, course, 'Enrolled successfully'));
};