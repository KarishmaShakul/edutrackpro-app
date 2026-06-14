import { useQuery }    from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Award, TrendingUp, BookOpen } from 'lucide-react';
import { gradeApi }    from '../../../api/index.js';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const GRADE_COLOR = {
  O:  'bg-purple-100 text-purple-700',
  'A+':'bg-blue-100  text-blue-700',
  A:  'bg-teal-100   text-teal-700',
  'B+':'bg-green-100 text-green-700',
  B:  'bg-lime-100   text-lime-700',
  C:  'bg-amber-100  text-amber-700',
  F:  'bg-red-100    text-red-600',
  I:  'bg-gray-100   text-gray-500',
};

export default function StudentGrades() {
  const user = useSelector(s => s.auth.user);

  const { data, isLoading } = useQuery({
    queryKey: ['grades','student', user?._id],
    queryFn:  () => gradeApi.getByStudent(user._id).then(r => r.data.data),
    enabled:  !!user?._id,
  });

  const grades     = data?.grades || [];
  const cgpa       = data?.cgpa   || '0.00';
  const published  = grades.filter(g => g.isPublished);
  const pending    = grades.filter(g => !g.isPublished);

  const radarData = published.map(g => ({
    course: g.course?.code || '',
    score:  g.percentage   || 0,
  }));

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
        <p className="text-gray-500 text-sm mt-1">Academic performance overview</p>
      </div>

      {/* CGPA card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm">Cumulative GPA</p>
            <p className="text-5xl font-bold mt-1">{cgpa}</p>
            <p className="text-purple-200 text-sm mt-2">out of 10.00</p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
            <Award size={40} className="text-white"/>
          </div>
        </div>
        <div className="flex gap-6 mt-6 text-sm">
          <div>
            <p className="text-purple-200">Published</p>
            <p className="font-bold text-lg">{published.length} courses</p>
          </div>
          <div>
            <p className="text-purple-200">Pending</p>
            <p className="font-bold text-lg">{pending.length} courses</p>
          </div>
          <div>
            <p className="text-purple-200">Best Grade</p>
            <p className="font-bold text-lg">
              {published.length
                ? published.sort((a,b) => b.gradePoints - a.gradePoints)[0]?.grade
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Radar chart */}
        {radarData.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Performance radar</h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid/>
                <PolarAngleAxis dataKey="course" tick={{ fontSize: 11 }}/>
                <Radar dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3}/>
                <Tooltip/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Grade summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Grade summary</h2>
          <div className="space-y-3">
            {published.map(g => (
              <div key={g._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <BookOpen size={14} className="text-amber-600"/>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{g.course?.name}</p>
                    <p className="text-xs text-gray-400">{g.course?.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{g.percentage}%</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                                    ${GRADE_COLOR[g.grade] || GRADE_COLOR.I}`}>
                    {g.grade}
                  </span>
                  <span className="text-xs text-gray-400">{g.gradePoints} GP</span>
                </div>
              </div>
            ))}
            {published.length === 0 && (
              <p className="text-center text-gray-400 py-4 text-sm">No published grades yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed grade table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Detailed grade card</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium text-center">Internal /40</th>
                <th className="pb-3 font-medium text-center">External /60</th>
                <th className="pb-3 font-medium text-center">Assignment /20</th>
                <th className="pb-3 font-medium text-center">Total</th>
                <th className="pb-3 font-medium text-center">%</th>
                <th className="pb-3 font-medium text-center">Grade</th>
                <th className="pb-3 font-medium text-center">GP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {published.map(g => (
                <tr key={g._id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <p className="font-medium text-gray-800">{g.course?.name}</p>
                    <p className="text-xs text-gray-400">{g.course?.code}</p>
                  </td>
                  <td className="py-3 text-center text-gray-700">{g.internal?.marks}</td>
                  <td className="py-3 text-center text-gray-700">{g.external?.marks}</td>
                  <td className="py-3 text-center text-gray-700">{g.assignment?.marks}</td>
                  <td className="py-3 text-center font-semibold text-gray-800">{g.totalMarks}</td>
                  <td className="py-3 text-center text-gray-700">{g.percentage}%</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                                      ${GRADE_COLOR[g.grade] || GRADE_COLOR.I}`}>
                      {g.grade}
                    </span>
                  </td>
                  <td className="py-3 text-center font-semibold text-purple-600">{g.gradePoints}</td>
                </tr>
              ))}
              {pending.map(g => (
                <tr key={g._id} className="opacity-50">
                  <td className="py-3">
                    <p className="font-medium text-gray-800">{g.course?.name}</p>
                    <p className="text-xs text-gray-400">{g.course?.code}</p>
                  </td>
                  <td colSpan={6} className="py-3 text-center text-xs text-gray-400 italic">
                    Grades not published yet
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No grade records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}