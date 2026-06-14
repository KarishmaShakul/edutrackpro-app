import api from './axios.js';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data)       => api.post('/auth/login', data),
  logout:         ()           => api.post('/auth/logout'),
  me:             ()           => api.get('/auth/me'),
  changePassword: (data)       => api.patch('/auth/change-password', data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll:              (params) => api.get('/users', { params }),
  getById:             (id)     => api.get(`/users/${id}`),
  create:              (data)   => api.post('/users', data),
  update:              (id, data) => api.patch(`/users/${id}`, data),
  remove:              (id)     => api.delete(`/users/${id}`),
  toggleStatus:        (id)     => api.patch(`/users/${id}/toggle-status`),
  getByDepartment:     (deptId) => api.get(`/users/department/${deptId}`),
  getNotifications:    ()       => api.get('/users/notifications'),
  markNotifRead:       (id)     => api.patch(`/users/notifications/${id}/read`),
};

// ── Departments ───────────────────────────────────────────────────────────────
export const deptApi = {
  getAll:     ()         => api.get('/departments'),
  getById:    (id)       => api.get(`/departments/${id}`),
  create:     (data)     => api.post('/departments', data),
  update:     (id, data) => api.patch(`/departments/${id}`, data),
  remove:     (id)       => api.delete(`/departments/${id}`),
  assignHOD:  (id, hodId)=> api.patch(`/departments/${id}/assign-hod`, { hodId }),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const courseApi = {
  getAll:          (params)              => api.get('/courses', { params }),
  getAvailable:    ()                    => api.get('/courses', { params: { available: true, limit: 100 } }),
  getById:         (id)                  => api.get(`/courses/${id}`),
  create:          (data)                => api.post('/courses', data),
  update:          (id, data)            => api.patch(`/courses/${id}`, data),
  remove:          (id)                  => api.delete(`/courses/${id}`),
  enroll:          (id, studentIds)      => api.post(`/courses/${id}/enroll`, { studentIds }),
  selfEnroll:      (id)                  => api.post(`/courses/${id}/self-enroll`),
  removeStudent:   (id, studentId)       => api.delete(`/courses/${id}/students/${studentId}`),
  addMaterial:     (id, data)            => api.post(`/courses/${id}/materials`, data),
  deleteMaterial:  (id, materialId)      => api.delete(`/courses/${id}/materials/${materialId}`),
  addAssignment:   (id, data)            => api.post(`/courses/${id}/assignments`, data),
  submitAssignment:(id, asgId, data)     => api.post(`/courses/${id}/assignments/${asgId}/submit`, data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  mark:           (data)       => api.post('/attendance', data),
  getByCourse:    (id, params) => api.get(`/attendance/course/${id}`, { params }),
  getByStudent:   (id)         => api.get(`/attendance/student/${id}`),
  getSession:     (id)         => api.get(`/attendance/session/${id}`),
  editSession:    (id, data)   => api.patch(`/attendance/session/${id}`, data),
};

// ── Grades ────────────────────────────────────────────────────────────────────
export const gradeApi = {
  upsert:         (data)   => api.post('/grades', data),
  publish:        (courseId) => api.post(`/grades/publish/${courseId}`),
  getByCourse:    (id)     => api.get(`/grades/course/${id}`),
  getByStudent:   (id)     => api.get(`/grades/student/${id}`),
  getDeptReport:  ()       => api.get('/grades/department/report'),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messageApi = {
  getConversations:  ()            => api.get('/messages/conversations'),
  openDirect:        (recipientId) => api.post('/messages/conversations/direct', { recipientId }),
  createGroup:       (data)        => api.post('/messages/conversations/group', data),
  getMessages:       (convId, params) => api.get(`/messages/conversations/${convId}`, { params }),
  send:              (data)        => api.post('/messages', data),
  remove:            (id)          => api.delete(`/messages/${id}`),
  announce:          (data)        => api.post('/messages/announce', data),
};