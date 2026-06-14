import { useQuery }  from '@tanstack/react-query';
import { useState }  from 'react';
import { gradeApi }  from '../../../api/index.js';
import { BarChart2, TrendingUp, TrendingDown, Award } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';

export default function GradeReport() {
  const { data: report = [], isLoading } = useQuery({
    queryKey: ['grade-report'],
    queryFn:  () => gradeApi.getDeptReport().then(r => r.data.data),
  });

  const radarData = report.map(r => ({
    course: r.course?.code || '',
    avg:    parseFloat(r.avg) || 0,
  }));

  const topCourse = [...report].sort((a,b) => parseFloat(b.avg) - parseFloat(a.avg))[0];
  const lowCourse = [...report].sort((a,b) => parseFloat(a.avg) - parseFloat(b.avg))[0];

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Grade Report</h1>
        <p className="text-gray-500 text-sm mt-1">Department-wide academic performance</p>
      </div>

      {/* Highlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart2 size={16} className="text-blue-600"/>
            </div>
            <p className="text-sm text-gray-500">Total courses</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{report.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600"/>
            </div>
            <p className="text-sm text-gray-500">Best performing</p>
          </div>
          <p className="text-lg font-bold text-gray-800">{topCourse?.course?.name || '—'}</p>
          <p className="text-sm text-green-600">{topCourse?.avg || 0}% avg</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown size={16} className="text-red-500"/>
            </div>
            <p className="text-sm text-gray-500">Needs attention</p>
          </div>
          <p className="text-lg font-bold text-gray-800">{lowCourse?.course?.name || '—'}</p>
          <p className="text-sm text-red-500">{lowCourse?.avg || 0}% avg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Average % by course</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={radarData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
              <XAxis dataKey="course" tick={{ fontSize: 11 }}/>
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }}/>
              <Tooltip/>
              <Bar dataKey="avg" fill="#1D4ED8" radius={[6,6,0,0]} name="Avg %"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Performance radar</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid/>
              <PolarAngleAxis dataKey="course" tick={{ fontSize: 11 }}/>
              <Radar dataKey="avg" stroke="#1D4ED8" fill="#1D4ED8" fillOpacity={0.25}/>
              <Tooltip/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Detailed breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Students</th>
                <th className="pb-3 font-medium">Avg %</th>
                <th className="pb-3 font-medium">Passed</th>
                <th className="pb-3 font-medium">Failed</th>
                <th className="pb-3 font-medium">Pass rate</th>
                <th className="pb-3 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.map((r, i) => {
                const passRate = r.totalStudents > 0
                  ? Math.round((r.passed / r.totalStudents) * 100) : 0;
                const avg = parseFloat(r.avg);
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-800">{r.course?.name}</p>
                      <p className="text-xs text-gray-400">{r.course?.code}</p>
                    </td>
                    <td className="py-3 text-gray-700">{r.totalStudents}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full"
                               style={{ width: `${avg}%` }}/>
                        </div>
                        <span className="text-gray-700">{r.avg}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-green-600 font-medium">{r.passed}</td>
                    <td className="py-3 text-red-500 font-medium">{r.failed}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${passRate >= 75 ? 'bg-green-100 text-green-700'
                        : passRate >= 50 ? 'bg-amber-100 text-amber-700'
                        :                  'bg-red-100   text-red-600'}`}>
                        {passRate}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                        ${avg >= 75 ? 'bg-green-100 text-green-700'
                        : avg >= 60 ? 'bg-blue-100  text-blue-700'
                        : avg >= 50 ? 'bg-amber-100 text-amber-700'
                        :             'bg-red-100   text-red-600'}`}>
                        {avg >= 75 ? 'Excellent' : avg >= 60 ? 'Good' : avg >= 50 ? 'Average' : 'Poor'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {report.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No grade data published yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}