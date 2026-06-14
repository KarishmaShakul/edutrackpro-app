import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm }   from 'react-hook-form';
import { useState }  from 'react';
import { Plus, BookOpen, Users, X, Trash2, UserPlus } from 'lucide-react';
import { courseApi, deptApi, userApi } from '../../../api/index.js';
import toast from 'react-hot-toast';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  </div>
);

export default function AdminCourses() {
  const qc = useQueryClient();
  const [modal, setModal]       = useState(null); // 'create' | { type: 'enroll', course }
  const [selectedStudents, setSelectedStudents] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['courses','admin'],
    queryFn:  () => courseApi.getAll({ limit: 100 }).then(r => r.data.data),
  });

  const { data: depts = [] } = useQuery({
    queryKey: ['departments'],
    queryFn:  () => deptApi.getAll().then(r => r.data.data),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['users','teachers'],
    queryFn:  () => userApi.getAll({ role: 'teacher', limit: 200 }).then(r => r.data.data.users),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['users','students'],
    queryFn:  () => userApi.getAll({ role: 'student', limit: 500 }).then(r => r.data.data.users),
    enabled:  modal?.type === 'enroll',
  });

  const createMutation = useMutation({
    mutationFn: courseApi.create,
    onSuccess:  () => { toast.success('Course created'); qc.invalidateQueries({ queryKey: ['courses'] }); setModal(null); reset(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: courseApi.remove,
    onSuccess:  () => { toast.success('Course deleted'); qc.invalidateQueries({ queryKey: ['courses'] }); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const enrollMutation = useMutation({
    mutationFn: ({ courseId, studentIds }) => courseApi.enroll(courseId, studentIds),
    onSuccess:  () => {
      toast.success('Students enrolled');
      qc.invalidateQueries({ queryKey: ['courses'] });
      setModal(null);
      setSelectedStudents([]);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const courses = data?.courses || [];

  const handleDelete = (course) => {
    if (!window.confirm(`Delete "${course.name}"? This will deactivate the course.`)) return;
    deleteMutation.mutate(course._id);
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} courses total</p>
        </div>
        <button onClick={() => { reset(); setModal('create'); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl
                     hover:bg-purple-700 transition-colors text-sm font-medium">
          <Plus size={16}/> New Course
        </button>
      </div>

      {isLoading
        ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map(c => (
              <div key={c._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <BookOpen size={18} className="text-teal-600"/>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{c.name}</h3>
                      <span className="text-xs text-gray-400">{c.code}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedStudents([]); setModal({ type: 'enroll', course: c }); }}
                      title="Enroll students"
                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <UserPlus size={16}/>
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={deleteMutation.isPending}
                      title="Delete course"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Dept: <span className="font-medium text-gray-700">{c.department?.name || '—'}</span></p>
                  <p>Teacher: <span className="font-medium text-gray-700">{c.teacher?.name || '—'}</span></p>
                  <p>Semester: <span className="font-medium text-gray-700">{c.semester}</span></p>
                  <div className="flex items-center gap-1 pt-1">
                    <Users size={12}/>
                    <span>{c.students?.length || 0} students enrolled</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {modal === 'create' && (
        <Modal title="New Course" onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Course Name</label>
              <input {...register('name', { required: 'Required' })}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Code</label>
                <input {...register('code', { required: 'Required' })}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Semester</label>
                <input {...register('semester', { required: 'Required' })} type="number" min={1} max={8}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select {...register('department', { required: 'Required' })}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="">Select department</option>
                {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Teacher</label>
              <select {...register('teacher', { required: 'Required' })}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="">Select teacher</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Credits</label>
                <input {...register('credits')} type="number" defaultValue={3}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Section</label>
                <input {...register('section')} placeholder="A"
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit"
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 font-medium">
                Create Course
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.type === 'enroll' && (
        <Modal title={`Enroll Students — ${modal.course.name}`} onClose={() => setModal(null)}>
          <p className="text-sm text-gray-500 mb-4">
            Select students to enroll in <strong>{modal.course.code}</strong>
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
            {students
              .filter(s => !modal.course.students?.some(id => id.toString() === s._id.toString()))
              .map(s => (
                <label key={s._id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                    ${selectedStudents.includes(s._id) ? 'border-purple-300 bg-purple-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(s._id)}
                    onChange={() => toggleStudent(s._id)}
                    className="rounded text-purple-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.rollNumber || s.email}</p>
                  </div>
                </label>
              ))}
            {students.length === 0 && (
              <p className="text-center text-gray-400 py-4 text-sm">No students found</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => enrollMutation.mutate({ courseId: modal.course._id, studentIds: selectedStudents })}
              disabled={!selectedStudents.length || enrollMutation.isPending}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 font-medium disabled:opacity-50">
              Enroll {selectedStudents.length || ''} Student{selectedStudents.length !== 1 ? 's' : ''}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
