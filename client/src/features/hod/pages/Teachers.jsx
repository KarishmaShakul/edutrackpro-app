import { useQuery }    from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useState }    from 'react';
import { MessageSquare, Mail, Phone, BookOpen, Search } from 'lucide-react';
import { userApi, courseApi, messageApi } from '../../../api/index.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Teachers() {
  const navigate = useNavigate();
  const user     = useSelector(s => s.auth.user);
  const deptId   = user?.department?._id || user?.department;
  const [search, setSearch] = useState('');

  const { data: deptUsers, isLoading } = useQuery({
    queryKey: ['dept-users', deptId],
    queryFn:  () => userApi.getByDepartment(deptId).then(r => r.data.data),
    enabled:  !!deptId,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses','hod'],
    queryFn:  () => courseApi.getAll().then(r => r.data.data),
  });

  const teachers = (deptUsers?.teachers || []).filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const courses = coursesData?.courses || [];

  const getCourseCount = (teacherId) =>
    courses.filter(c => c.teacher?._id === teacherId || c.teacher === teacherId).length;

  const handleMessage = async (teacherId) => {
    try {
      const { data } = await messageApi.openDirect(teacherId);
      navigate('/hod/messages', { state: { conversationId: data.data._id } });
    } catch {
      toast.error('Could not open conversation');
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          <p className="text-gray-500 text-sm mt-1">{teachers.length} teachers in your department</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search teachers..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-300"/>
      </div>

      {/* Teacher cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {teachers.map(teacher => (
          <div key={teacher._id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700
                              flex items-center justify-center text-xl font-bold">
                {teacher.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                <p className="text-xs text-gray-400">{teacher.designation || 'Teacher'}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={12}/>
                <span className="truncate">{teacher.email}</span>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={12}/>
                  <span>{teacher.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BookOpen size={12}/>
                <span>{getCourseCount(teacher._id)} courses assigned</span>
              </div>
            </div>

            {/* Courses taught */}
            <div className="flex flex-wrap gap-1 mb-4">
              {courses
                .filter(c => c.teacher?._id === teacher._id || c.teacher === teacher._id)
                .map(c => (
                  <span key={c._id}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {c.code}
                  </span>
                ))
              }
            </div>

            {/* Message button */}
            <button
              onClick={() => handleMessage(teacher._id)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-blue-200
                         text-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium">
              <MessageSquare size={14}/>
              Send Message
            </button>
          </div>
        ))}

        {teachers.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400">
            No teachers found in your department
          </div>
        )}
      </div>
    </div>
  );
}