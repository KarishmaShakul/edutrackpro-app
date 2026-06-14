import { useQuery }    from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Users, BookOpen, BarChart2,
  TrendingUp, UserCheck, AlertTriangle,
} from 'lucide-react';
import { userApi, courseApi, gradeApi } from '../../../api/index.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid,
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-blue-600 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function HodDashboard() {
  const user = useSelector(s => s.auth.user);
  const deptId = user?.department?._id || user?.department;

  const { data: deptUsers } = useQuery({
    queryKey: ['dept-users', deptId],
    queryFn:  () => userApi.getByDepartment(deptId).then(r => r.data.data),
    enabled:  !!deptId,
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'hod'],
    queryFn:  () => courseApi.getAll().then(r => r.data.data),
  });

  const { data: gradeReport } = useQuery({
    queryKey: ['grade-report'],
    queryFn:  () => gradeApi.getDeptReport().then(r => r.data.data),
  });

  const teachers = deptUsers?.teachers || [];
  const students = deptUsers?.students || [];
  const courses  = coursesData?.courses || [];
  const report   = gradeReport || [];

  const avgData = report.map(r => ({
    name: r.course?.code || '',
    avg:  parseFloat(r.avg) || 0,
    pass: r.passed || 0,
    fail: r.failed || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">HOD Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Department performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={UserCheck}    label="Teachers"       value={teachers.length} color="bg-blue-600"   />
        <StatCard icon={Users}        label="Students"       value={students.length} color="bg-teal-600"   />
        <StatCard icon={BookOpen}     label="Courses"        value={courses.length}  color="bg-purple-600" />
        <StatCard icon={BarChart2}    label="Courses Graded" value={report.filter(r => r.totalStudents > 0).length} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Average marks per course */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Average marks per course</h2>
          {avgData.length === 0
            ? <p className="text-gray-400 text-sm text-center py-8">No grade data yet</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={avgData} barSize={20}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <Bar dataKey="avg" fill="#1D4ED8" radius={[4,4,0,0]} name="Avg %" />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Pass vs Fail */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Pass vs Fail per course</h2>
          {avgData.length === 0
            ? <p className="text-gray-400 text-sm text-center py-8">No grade data yet</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={avgData} barSize={14}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <Bar dataKey="pass" fill="#0F766E" radius={[4,4,0,0]} name="Passed" />
                  <Bar dataKey="fail" fill="#DC2626" radius={[4,4,0,0]} name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Course summary table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Course summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Code</th>
                <th className="pb-3 font-medium">Students</th>
                <th className="pb-3 font-medium">Avg %</th>
                <th className="pb-3 font-medium">Passed</th>
                <th className="pb-3 font-medium">Failed</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{r.course?.name}</td>
                  <td className="py-3 text-gray-500">{r.course?.code}</td>
                  <td className="py-3 text-gray-700">{r.totalStudents}</td>
                  <td className="py-3 text-gray-700">{r.avg}%</td>
                  <td className="py-3 text-green-600 font-medium">{r.passed}</td>
                  <td className="py-3 text-red-500 font-medium">{r.failed}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${parseFloat(r.avg) >= 60
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'}`}>
                      {parseFloat(r.avg) >= 60 ? 'Good' : 'Needs attention'}
                    </span>
                  </td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}