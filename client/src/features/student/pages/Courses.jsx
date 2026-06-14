import { useState }    from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BookOpen, ChevronRight, Plus, Search } from 'lucide-react';
import { courseApi }   from '../../../api/index.js';
import toast           from 'react-hot-toast';

export default function StudentCourses() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const user      = useSelector(s => s.auth.user);
  const [tab, setTab]     = useState('enrolled');
  const [search, setSearch] = useState('');

  const { data: enrolledData, isLoading: loadingEnrolled } = useQuery({
    queryKey: ['courses','student'],
    queryFn:  () => courseApi.getAll({ limit: 100 }).then(r => r.data.data),
  });

  const { data: availableData, isLoading: loadingAvailable } = useQuery({
    queryKey: ['courses','available'],
    queryFn:  () => courseApi.getAvailable().then(r => r.data.data),
    enabled:  tab === 'browse',
  });

  const enrollMutation = useMutation({
    mutationFn: courseApi.selfEnroll,
    onSuccess:  () => {
      toast.success('Enrolled successfully!');
      qc.invalidateQueries({ queryKey: ['courses'] });
      setTab('enrolled');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Enrollment failed'),
  });

  const enrolled  = enrolledData?.courses  || [];
  const available = (availableData?.courses || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = tab === 'enrolled' ? loadingEnrolled : loadingAvailable;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <p className="text-gray-500 text-sm mt-1">
          {enrolled.length} enrolled · Browse available courses in your department
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'enrolled', label: `Enrolled (${enrolled.length})` },
          { id: 'browse',   label: 'Browse & Enroll' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.id ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-amber-300"/>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : tab === 'enrolled' ? (
        <div className="space-y-3">
          {enrolled.map(course => (
            <div key={course._id}
              onClick={() => navigate(`/student/courses/${course._id}`)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
                         hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} className="text-amber-600"/>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{course.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {course.code}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {course.teacher?.name || 'No teacher'} · {course.credits} credits · Sem {course.semester}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{course.materialCount ?? 0} materials</span>
                      <span>{course.assignmentCount ?? 0} assignments</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300"/>
              </div>
            </div>
          ))}

          {enrolled.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-400 mb-4">You are not enrolled in any courses yet</p>
              <button
                onClick={() => setTab('browse')}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
                Browse Available Courses →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {!user?.department && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
              Your account has no department assigned. Contact your admin to enroll in courses.
            </div>
          )}

          {available.map(course => (
            <div key={course._id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen size={20} className="text-blue-600"/>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{course.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {course.code}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {course.teacher?.name || 'No teacher'} · {course.credits} credits · Sem {course.semester}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{course.department?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => enrollMutation.mutate(course._id)}
                  disabled={enrollMutation.isPending || !user?.department}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl
                             hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50">
                  <Plus size={16}/> Enroll
                </button>
              </div>
            </div>
          ))}

          {available.length === 0 && user?.department && (
            <div className="py-16 text-center text-gray-400">
              No available courses in your department right now
            </div>
          )}
        </div>
      )}
    </div>
  );
}
