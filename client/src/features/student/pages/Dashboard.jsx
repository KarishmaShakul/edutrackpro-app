import { useQuery }    from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ClipboardList, BarChart2,
  AlertTriangle, CheckCircle, TrendingUp,
} from 'lucide-react';
import { courseApi, attendanceApi, gradeApi } from '../../../api/index.js';

const StatCard = ({ icon: Icon, label, value, color, sub, onClick }) => (
  <div onClick={onClick}
    className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4
                ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user     = useSelector(s => s.auth.user);

  const { data: coursesData } = useQuery({
    queryKey: ['courses','student'],
    queryFn:  () => courseApi.getAll().then(r => r.data.data),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance','student', user?._id],
    queryFn:  () => attendanceApi.getByStudent(user._id).then(r => r.data.data),
    enabled:  !!user?._id,
  });

  const { data: gradesData } = useQuery({
    queryKey: ['grades','student', user?._id],
    queryFn:  () => gradeApi.getByStudent(user._id).then(r => r.data.data),
    enabled:  !!user?._id,
  });

  const courses    = coursesData?.courses   || [];
  const attendance = attendanceData         || [];
  const grades     = gradesData?.grades     || [];
  const cgpa       = gradesData?.cgpa       || '0.00';

  const atRiskCourses = attendance.filter(a => a.status === 'danger' || a.status === 'warning');
  const avgAttendance = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-amber-100 text-sm mt-1">
          {user?.rollNumber} · Semester {user?.semester} · Section {user?.section}
        </p>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <p className="text-amber-200">CGPA</p>
            <p className="text-2xl font-bold">{cgpa}</p>
          </div>
          <div>
            <p className="text-amber-200">Attendance</p>
            <p className="text-2xl font-bold">{avgAttendance}%</p>
          </div>
          <div>
            <p className="text-amber-200">Courses</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={BookOpen} label="Enrolled Courses" value={courses.length}
          color="bg-amber-500" onClick={() => navigate('/student/courses')}
        />
        <StatCard
          icon={ClipboardList} label="Avg Attendance" value={`${avgAttendance}%`}
          color={avgAttendance >= 75 ? 'bg-green-500' : avgAttendance >= 60 ? 'bg-amber-500' : 'bg-red-500'}
          sub={avgAttendance < 75 ? '⚠️ Below required 75%' : '✅ Good standing'}
          onClick={() => navigate('/student/attendance')}
        />
        <StatCard
          icon={BarChart2} label="CGPA" value={cgpa}
          color="bg-purple-600" onClick={() => navigate('/student/grades')}
        />
      </div>

      {/* Attendance warnings */}
      {atRiskCourses.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500"/>
            <h2 className="font-semibold text-red-700">Attendance Warning</h2>
          </div>
          <div className="space-y-2">
            {atRiskCourses.map((a, i) => (
              <div key={i}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3
                           border border-red-100">
                <p className="text-sm font-medium text-gray-800">{a.course?.name}</p>
                <span className={`text-sm font-bold px-3 py-1 rounded-full
                  ${a.status === 'danger'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-600'}`}>
                  {a.percentage}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-500 mt-3">
            Minimum required attendance is 75%. Contact your teacher if you have valid reasons.
          </p>
        </div>
      )}

      {/* Recent courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">My Courses</h2>
          <button onClick={() => navigate('/student/courses')}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View all →
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-dashed border-gray-200 text-center">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">No courses enrolled yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Browse available courses in your department and enroll to get started
            </p>
            <button
              onClick={() => navigate('/student/courses')}
              className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
              Browse Courses →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.slice(0, 6).map(course => (
              <div key={course._id}
                onClick={() => navigate(`/student/courses/${course._id}`)}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
                           hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <BookOpen size={18} className="text-amber-600"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{course.name}</h3>
                    <span className="text-xs text-gray-400">{course.code}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Teacher: <span className="font-medium text-gray-700">{course.teacher?.name || '—'}</span>
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>Sem {course.semester}</span>
                  <span>{course.credits} credits</span>
                  <span>{course.materialCount ?? 0} materials</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}