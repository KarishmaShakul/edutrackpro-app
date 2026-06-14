import { useState }                    from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm }                     from 'react-hook-form';
import { Plus, Edit2, Trash2, X, Building2, Users, BookOpen } from 'lucide-react';
import { deptApi, userApi }            from '../../../api/index.js';
import toast                           from 'react-hot-toast';

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

export default function Departments() {
  const qc = useQueryClient();
  const [modal, setModal]   = useState(null); // 'create' | 'edit' | 'hod'
  const [selected, setSelected] = useState(null);

  const { data: depts = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn:  () => deptApi.getAll().then(r => r.data.data),
  });

  const { data: hodUsers = [] } = useQuery({
    queryKey: ['users','hod'],
    queryFn:  () => userApi.getAll({ role: 'hod', limit: 100 }).then(r => r.data.data.users),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const invalidate = () => qc.invalidateQueries({ queryKey: ['departments'] });

  const createMutation = useMutation({
    mutationFn: deptApi.create,
    onSuccess:  () => { toast.success('Department created'); invalidate(); setModal(null); reset(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => deptApi.update(id, data),
    onSuccess:  () => { toast.success('Department updated'); invalidate(); setModal(null); reset(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deptApi.remove,
    onSuccess:  () => { toast.success('Department deleted'); invalidate(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const hodMutation = useMutation({
    mutationFn: ({ id, hodId }) => deptApi.assignHOD(id, hodId),
    onSuccess:  () => { toast.success('HOD assigned'); invalidate(); setModal(null); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const openEdit = (dept) => {
    setSelected(dept);
    setValue('name', dept.name);
    setValue('code', dept.code);
    setValue('description', dept.description);
    setModal('edit');
  };

  const onSubmit = (data) => {
    if (modal === 'create') createMutation.mutate(data);
    if (modal === 'edit')   updateMutation.mutate({ id: selected._id, data });
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
          <p className="text-gray-500 text-sm mt-1">{depts.length} departments total</p>
        </div>
        <button
          onClick={() => { reset(); setModal('create'); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white
                     rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Plus size={16}/> New Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {depts.map(dept => (
          <div key={dept._id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-blue-600"/>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{dept.code}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(dept)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 size={14}/>
                </button>
                <button onClick={() => { if(window.confirm('Delete department?')) deleteMutation.mutate(dept._id); }}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4 line-clamp-2">{dept.description || 'No description'}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1"><Users size={12}/> {dept.teacherCount || 0} teachers</span>
              <span className="flex items-center gap-1"><BookOpen size={12}/> {dept.studentCount || 0} students</span>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-1">Head of Department</p>
              {dept.hod ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    {dept.hod.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{dept.hod.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => { setSelected(dept); setModal('hod'); }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                  + Assign HOD
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'New Department' : 'Edit Department'}
               onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input {...register('name', { required: 'Required' })}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Code</label>
              <input {...register('code', { required: 'Required' })}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"/>
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea {...register('description')} rows={3}
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"/>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 font-medium">
                {modal === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign HOD Modal */}
      {modal === 'hod' && (
        <Modal title={`Assign HOD — ${selected?.name}`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {hodUsers.length === 0
              ? <p className="text-gray-400 text-sm text-center py-4">No HOD users found. Create a HOD user first.</p>
              : hodUsers.map(hod => (
                <button key={hod._id}
                  onClick={() => hodMutation.mutate({ id: selected._id, hodId: hod._id })}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200
                             rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all text-left">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {hod.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{hod.name}</p>
                    <p className="text-xs text-gray-400">{hod.email}</p>
                  </div>
                </button>
              ))
            }
          </div>
        </Modal>
      )}
    </div>
  );
}