import { useState }    from 'react';
import { useParams }   from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm }     from 'react-hook-form';
import {
  BookOpen, Users, Plus, Trash2,
  FileText, Link, Video, X, Upload,
} from 'lucide-react';
import { courseApi }   from '../../../api/index.js';
import toast           from 'react-hot-toast';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18}/></button>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  </div>
);

const TYPE_ICON = { pdf: FileText, video: Video, link: Link, other: FileText };

export default function CourseDetail() {
  const { id }  = useParams();
  const qc      = useQueryClient();
  const [tab,   setTab]   = useState('materials');
  const [modal, setModal] = useState(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn:  () => courseApi.getById(id).then(r => r.data.data),
  });

  const { register: regMat, handleSubmit: submitMat, reset: resetMat } = useForm();
  const { register: regAsg, handleSubmit: submitAsg, reset: resetAsg } = useForm();

  const invalidate = () => qc.invalidateQueries({ queryKey: ['course', id] });

  const addMatMutation = useMutation({
    mutationFn: (data) => courseApi.addMaterial(id, data),
    onSuccess:  () => { toast.success('Material added'); invalidate(); setModal(null); resetMat(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const delMatMutation = useMutation({
    mutationFn: (matId) => courseApi.deleteMaterial(id, matId),
    onSuccess:  () => { toast.success('Material deleted'); invalidate(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const addAsgMutation = useMutation({
    mutationFn: (data) => courseApi.addAssignment(id, data),
    onSuccess:  () => { toast.success('Assignment added'); invalidate(); setModal(null); resetAsg(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!course) return <div className="text-center py-20 text-gray-400">Course not found</div>;

  const tabs = ['materials', 'assignments', 'students'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center">
              <BookOpen size={24} className="text-teal-600"/>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{course.name}</h1>
              <p className="text-gray-400 text-sm">{course.code} · Semester {course.semester} · {course.credits} credits</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={16}/>
            <span>{course.students?.length || 0} students</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${tab === t ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Materials tab */}
      {tab === 'materials' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Course Materials</h2>
            <button onClick={() => setModal('material')}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white
                         rounded-xl hover:bg-teal-700 transition-colors text-sm">
              <Plus size={14}/> Add Material
            </button>
          </div>
          <div className="space-y-3">
            {course.materials?.map(mat => {
              const Icon = TYPE_ICON[mat.type] || FileText;
              return (
                <div key={mat._id}
                  className="flex items-center justify-between p-4 border border-gray-100
                             rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
                      <Icon size={16} className="text-teal-600"/>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{mat.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{mat.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={mat.url} target="_blank" rel="noreferrer"
                      className="text-xs text-teal-600 hover:underline">Open</a>
                    <button onClick={() => delMatMutation.mutate(mat._id)}
                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              );
            })}
            {!course.materials?.length && (
              <p className="text-center text-gray-400 py-8">No materials yet. Add your first one!</p>
            )}
          </div>
        </div>
      )}

      {/* Assignments tab */}
      {tab === 'assignments' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Assignments</h2>
            <button onClick={() => setModal('assignment')}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white
                         rounded-xl hover:bg-teal-700 transition-colors text-sm">
              <Plus size={14}/> Add Assignment
            </button>
          </div>
          <div className="space-y-3">
            {course.assignments?.map(asg => (
              <div key={asg._id}
                className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{asg.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{asg.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Due: {new Date(asg.dueDate).toLocaleDateString()}</p>
                    <p className="text-xs text-teal-600 font-medium">Max: {asg.maxMarks} marks</p>
                    <p className="text-xs text-gray-400">{asg.submissions?.length || 0} submissions</p>
                  </div>
                </div>
              </div>
            ))}
            {!course.assignments?.length && (
              <p className="text-center text-gray-400 py-8">No assignments yet</p>
            )}
          </div>
        </div>
      )}

      {/* Students tab */}
      {tab === 'students' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            Enrolled Students ({course.students?.length || 0})
          </h2>
          <div className="divide-y divide-gray-50">
            {course.students?.map(s => (
              <div key={s._id} className="py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700
                                flex items-center justify-center text-xs font-bold">
                  {s.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.rollNumber} · Sec {s.section}</p>
                </div>
              </div>
            ))}
            {!course.students?.length && (
              <p className="text-center text-gray-400 py-8">No students enrolled</p>
            )}
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {modal === 'material' && (
        <Modal title="Add Material" onClose={() => setModal(null)}>
          <form onSubmit={submitMat(d => addMatMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input {...regMat('title', { required: 'Required' })}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-400"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select {...regMat('type')}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">URL</label>
              <input {...regMat('url', { required: 'Required' })} placeholder="https://..."
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-400"/>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm
                           hover:bg-teal-700 font-medium">
                Add Material
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Assignment Modal */}
      {modal === 'assignment' && (
        <Modal title="Add Assignment" onClose={() => setModal(null)}>
          <form onSubmit={submitAsg(d => addAsgMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input {...regAsg('title', { required: 'Required' })}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-400"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea {...regAsg('description')} rows={3}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Due Date</label>
                <input {...regAsg('dueDate', { required: 'Required' })} type="date"
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-teal-400"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Max Marks</label>
                <input {...regAsg('maxMarks')} type="number" defaultValue={100}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-teal-400"/>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm
                           hover:bg-teal-700 font-medium">
                Add Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}