import { useRef, useState } from 'react';
import { useDispatch }      from 'react-redux';
import { Camera, Loader2 }  from 'lucide-react';
import { updateUser }       from '../../store/slices/authSlice.js';
import api                  from '../../api/axios.js';
import toast                from 'react-hot-toast';

export default function AvatarUpload({ user }) {
  const dispatch  = useDispatch();
  const inputRef  = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(updateUser({ avatar: data.data.avatar }));
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {user?.avatar?.url ? (
        <img src={user.avatar.url} alt={user.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"/>
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500
                        flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {user?.name?.charAt(0)}
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200
                   rounded-xl shadow flex items-center justify-center
                   hover:bg-gray-50 transition-colors">
        {loading
          ? <Loader2 size={14} className="animate-spin text-purple-600"/>
          : <Camera size={14} className="text-gray-600"/>
        }
      </button>

      <input ref={inputRef} type="file" accept="image/*"
        className="hidden" onChange={handleChange}/>
    </div>
  );
}