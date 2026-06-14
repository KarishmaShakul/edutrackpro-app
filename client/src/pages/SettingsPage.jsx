import { useState }     from 'react';
import { useSelector }  from 'react-redux';
import { useMutation }  from '@tanstack/react-query';
import { useForm }      from 'react-hook-form';
import { authApi, userApi } from '../api/index.js';
import { updateUser }   from '../store/slices/authSlice.js';
import { useDispatch }  from 'react-redux';
import AvatarUpload     from '../components/common/AvatarUpload.jsx';
import toast            from 'react-hot-toast';
import { Lock, User, Save } from 'lucide-react';

export default function SettingsPage() {
  const dispatch  = useDispatch();
  const user      = useSelector(s => s.auth.user);
  const [tab, setTab] = useState('profile');

  const { register: regProfile, handleSubmit: submitProfile } = useForm({
    defaultValues: {
      name:          user?.name          || '',
      phone:         user?.phone         || '',
      designation:   user?.designation   || '',
      qualification: user?.qualification || '',
    },
  });

  const { register: regPw, handleSubmit: submitPw, reset: resetPw } = useForm();

  const profileMutation = useMutation({
    mutationFn: (data) => userApi.update(user._id, data),
    onSuccess:  (res)  => {
      dispatch(updateUser(res.data.data));
      toast.success('Profile updated');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const pwMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess:  () => { toast.success('Password changed'); resetPw(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile and account</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['profile','password'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${tab === t ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'profile' ? '👤 Profile' : '🔒 Password'}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <AvatarUpload user={user}/>
            <div>
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={submitProfile(d => profileMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input {...regProfile('name')}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <input {...regProfile('phone')}
                  className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-purple-400"/>
              </div>
              {(user?.role === 'teacher' || user?.role === 'hod') && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Designation</label>
                    <input {...regProfile('designation')}
                      className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Qualification</label>
                    <input {...regProfile('qualification')}
                      className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                  </div>
                </>
              )}
            </div>
            <button type="submit"
              disabled={profileMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white
                         rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium
                         disabled:opacity-60">
              <Save size={15}/>
              {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <form onSubmit={submitPw(d => pwMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <input {...regPw('currentPassword', { required: 'Required' })} type="password"
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-purple-400"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input {...regPw('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                type="password"
                className="mt-1 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-purple-400"/>
            </div>
            <button type="submit"
              disabled={pwMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white
                         rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium
                         disabled:opacity-60">
              <Lock size={15}/>
              {pwMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}