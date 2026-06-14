import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { authApi } from '../api/index.js';
import { setCredentials } from '../store/slices/authSlice.js';

const ROLE_COLORS = {
  admin:   'bg-purple-600',
  hod:     'bg-blue-600',
  teacher: 'bg-teal-600',
  student: 'bg-amber-500',
};

const ROLE_ROUTES = {
  admin:   '/admin',
  hod:     '/hod',
  teacher: '/teacher',
  student: '/student',
};

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data } = await authApi.login(formData);
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(ROLE_ROUTES[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-10 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <GraduationCap size={36} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">EduTrackPro</h1>
          <p className="text-purple-200 mt-1 text-sm">Learning Management System</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your portal</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@institution.edu"
                {...register('email', {
                  required: 'Email is required',
                  pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required:  'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm pr-12
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600
                         text-white font-semibold rounded-xl hover:opacity-90
                         transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          {/* Role badges */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Available portals</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {Object.entries(ROLE_COLORS).map(([role, color]) => (
                <span key={role}
                  className={`${color} text-white text-xs px-3 py-1 rounded-full capitalize font-medium`}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 text-white/40 text-xs">
        © 2026 EduTrackPro. All rights reserved.
      </p>
    </div>
  );
}