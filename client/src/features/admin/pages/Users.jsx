import { useState }  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm }   from 'react-hook-form';
import {
  Plus, Search, Filter, Edit2,
  Trash2, X, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { userApi, deptApi } from '../../../api/index.js';
import toast from 'react-hot-toast';

const ROLES = ['admin','hod','teacher','student'];

const ROLE_STYLE = {
  admin:   'bg-purple-100 text-purple-700',
  hod:     'bg-blue-100   text-blue-700',
  teacher: 'bg-teal-100   text-teal-700',
  student: 'bg-amber-100  text-amber-700',
};

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

export default function Users() {
  const qc = useQueryClient();
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [filters,  setFilters]  = useState({ role: '', search: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn:  () => userApi.getAll({ ...filters, limit: 15 }).then(r => r.data.data),
  });

  const { data: depts = [] } = useQuery({
    queryKey: ['departments'],
    queryFn:  () => deptApi.getAll().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const watchRole = watch('role');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess:  () => { toast.success('User created'); invalidate(); setModal(null); reset(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess:  () => { toast.success('User updated'); invalidate(); setModal(null); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess:  () => { toast.success('User deleted'); invalidate(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const toggleMutation = useMutation({
    mutationFn: userApi.toggleStatus,
    onSuccess:  () => { toast.success('Status updated'); invalidate(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const openEdit = (user) => {
    setSelected(user);
    setValue('name',        user.name);
    setValue('email',       user.email);
    setValue('role',        user.role);
    setValue('department',  user.department?._id || '');
    setValue('designation', user.designation || '');
    setValue('phone',       user.phone || '');
    setValue('rollNumber',  user.rollNumber || '');
    setValue('semester',    user.semester || 1);
    setValue('section',     user.section || '');
    setModal('edit');
  };

  const onSubmit = (data) => {
    if (modal === 'create') createMutation.mutate(data);
    if (modal === 'edit')   updateMutation.mutate({ id: selected._id, data });
  };

  const users      = data?.users      || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} total users</p>
        </div>
        <button onClick={() => { reset(); setModal('create'); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white
                     rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium">
          <Plus size={16}/> New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            placeholder="Search name, email, roll..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-purple-300"/>
        </div>
        <select
          value={filters.role}
          onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
        <select
          value={filters.department || ''}
          onChange={e => setFilters(f => ({ ...f, department: e.target.value, page: 1 }))}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
          <option value="">All departments</option>
          {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700
                                        flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_STYLE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.department?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {u.role === 'student'
                        ? `Roll: ${u.rollNumber || '—'} | Sem: ${u.semester}`
                        : u.designation || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleMutation.mutate(u._id)}>
                        {u.isActive
                          ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><ToggleRight size={16}/> Active</span>
                          : <span className="flex items-center gap-1 text-red-400   text-xs font-medium"><ToggleLeft  size={16}/> Inactive</span>
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={14}/>
                        </button>
                        <button onClick={() => { if(window.confirm('Delete user?')) deleteMutation.mutate(u._id); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'New User' : 'Edit User'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input {...register('name', { required: 'Required' })}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input {...register('email', { required: 'Required' })} type="email"
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              {modal === 'create' && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password"
                    className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select {...register('role', { required: 'Required' })}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option value="">Select role</option>
                  {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <select {...register('department')}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option value="">None</option>
                  {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input {...register('phone')}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              </div>
              {(watchRole === 'teacher' || watchRole === 'hod') && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Designation</label>
                  <input {...register('designation')}
                    className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
              )}
              {watchRole === 'student' && (<>
                <div>
                  <label className="text-sm font-medium text-gray-700">Roll Number</label>
                  <input {...register('rollNumber')}
                    className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Semester</label>
                  <input {...register('semester')} type="number" min={1} max={8}
                    className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Section</label>
                  <input {...register('section')}
                    className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                </div>
              </>)}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 font-medium">
                {modal === 'create' ? 'Create User' : 'Update User'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}