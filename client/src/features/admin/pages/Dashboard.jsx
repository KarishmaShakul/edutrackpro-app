import { useQuery }  from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Users, BookOpen, Building2, GraduationCap,
  TrendingUp, UserCheck, AlertCircle, Bell,
} from 'lucide-react';
import { userApi, deptApi, courseApi } from '../../../api/index.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-green-600 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

const COLORS = ['#7C3AED','#1D4ED8','#0F766E','#B45309'];

export default function AdminDashboard() {
  const { data: usersData }   = useQuery({ queryKey: ['users','all'],   queryFn: () => userApi.getAll({ limit: 1000 }).then(r => r.data.data) });
  const { data: deptsData }   = useQuery({ queryKey: ['departments'],   queryFn: () => deptApi.getAll().then(r => r.data.data) });
  const { data: coursesData } = useQuery({ queryKey: ['courses','all'], queryFn: () => courseApi.getAll({ limit: 1000 }).then(r => r.data.data) });

  const users   = usersData?.users   || [];
  const depts   = deptsData          || [];
  const courses = coursesData?.courses || [];

  const roleCount = (role) => users.filter(u => u.role === role).length;

  const pieData = [
    { name: 'Admins',   value: roleCount('admin')   },
    { name: 'HODs',     value: roleCount('hod')     },
    { name: 'Teachers', value: roleCount('teacher') },
    { name: 'Students', value: roleCount('student') },
  ];

  const deptBarData = depts.map(d => ({
    name:     d.code,
    teachers: d.teacherCount || 0,
    students: d.studentCount || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">System overview and analytics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total Users"    value={users.length}          color="bg-purple-600" />
        <StatCard icon={Building2}   label="Departments"    value={depts.length}          color="bg-blue-600"   />
        <StatCard icon={BookOpen}    label="Courses"        value={courses.length}        color="bg-teal-600"   />
        <StatCard icon={GraduationCap} label="Students"    value={roleCount('student')}  color="bg-amber-500"  />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Role distribution pie */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">User distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                   dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Dept bar chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Department strength</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptBarData} barSize={16}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="teachers" fill="#0F766E" radius={[4,4,0,0]} name="Teachers" />
              <Bar dataKey="students" fill="#7C3AED" radius={[4,4,0,0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Recently added users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.slice(0, 8).map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-gray-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700
                                    flex items-center justify-center text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                      ${ u.role==='admin'   ? 'bg-purple-100 text-purple-700' :
                         u.role==='hod'     ? 'bg-blue-100   text-blue-700'   :
                         u.role==='teacher' ? 'bg-teal-100   text-teal-700'   :
                                              'bg-amber-100  text-amber-700'  }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{u.department?.name || '—'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}