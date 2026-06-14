import { useQuery }    from '@tanstack/react-query';
import { useState }    from 'react';
import { BookOpen, Users, Clock, Search, ChevronRight } from 'lucide-react';
import { courseApi }   from '../../../api/index.js';
import { useNavigate } from 'react-router-dom';

export default function HodCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['courses','hod'],
    queryFn:  () => courseApi.getAll().then(r => r.data.data),
  });

  const courses = (data?.courses || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Department Courses</h1>
        <p className="text-gray-500 text-sm mt-1">{courses.length} courses in your department</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-300"/>
      </div>

      {/* Course list */}
      <div className="space-y-3">
        {courses.map(course => (
          <div key={course._id}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
                       hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/hod/courses/${course._id}`)}>
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
                    {course.teacher?.name || 'No teacher assigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={14}/>
                  <span>{course.students?.length || 0} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14}/>
                  <span>Sem {course.semester}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                  ${course.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
                <ChevronRight size={16} className="text-gray-300"/>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            No courses found in your department
          </div>
        )}
      </div>
    </div>
  );
}