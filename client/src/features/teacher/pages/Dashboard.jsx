import { useQuery }    from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { BookOpen, Users, ClipboardList, BarChart2 } from 'lucide-react';
import { courseApi, attendanceApi } from '../../../api/index.js';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <div onClick={onClick}
    className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4
                ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user     = useSelector(s => s.auth.user);

  const { data } = useQuery({
    queryKey: ['courses','teacher'],
    queryFn:  () => courseApi.getAll().then(r => r.data.data),
  });

  const courses = data?.courses || [];
  const totalStudents = courses.reduce((s, c) => s + (c.students?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your teaching overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}     label="My Courses"       value={courses.length}  color="bg-teal-600"   onClick={() => navigate('/teacher/courses')}    />
        <StatCard icon={Users}        label="Total Students"   value={totalStudents}   color="bg-blue-600"   />
        <StatCard icon={ClipboardList}label="Mark Attendance"  value="Today"           color="bg-purple-600" onClick={() => navigate('/teacher/attendance')} />
        <StatCard icon={BarChart2}    label="Enter Grades"     value="Grades"          color="bg-amber-500"  onClick={() => navigate('/teacher/grades')}     />
      </div>

      {/* Course cards */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-4">My courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course._id}
              onClick={() => navigate(`/teacher/courses/${course._id}`)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
                         hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <BookOpen size={18} className="text-teal-600"/>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm group-hover:text-teal-600 transition-colors">
                    {course.name}
                  </h3>
                  <span className="text-xs text-gray-400">{course.code}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={11}/> {course.students?.length || 0} students
                </span>
                <span>Sem {course.semester}</span>
                <span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium">
                  {course.credits} credits
                </span>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-3 py-12 text-center text-gray-400">
              No courses assigned yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}