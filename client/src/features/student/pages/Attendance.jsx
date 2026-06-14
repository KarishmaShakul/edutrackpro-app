import { useQuery }    from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { attendanceApi } from '../../../api/index.js';

const StatusBadge = ({ status }) => {
  const config = {
    safe:    { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Safe'    },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Warning' },
    danger:  { icon: XCircle,    color: 'text-red-600',   bg: 'bg-red-100',   label: 'Danger'  },
  };
  const { icon: Icon, color, bg, label } = config[status] || config.safe;
  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${bg} ${color}`}>
      <Icon size={12}/> {label}
    </span>
  );
};

export default function StudentAttendance() {
  const user = useSelector(s => s.auth.user);

  const { data: summary = [], isLoading } = useQuery({
    queryKey: ['attendance','student', user?._id],
    queryFn:  () => attendanceApi.getByStudent(user._id).then(r => r.data.data),
    enabled:  !!user?._id,
  });

  const overall = summary.length
    ? Math.round(summary.reduce((s, a) => s + a.percentage, 0) / summary.length)
    : 0;

  const dangerCount  = summary.filter(a => a.status === 'danger').length;
  const warningCount = summary.filter(a => a.status === 'warning').length;

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track your attendance across all courses</p>
      </div>

      {/* Overall summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <div className={`text-4xl font-bold mb-1
            ${overall >= 75 ? 'text-green-600' : overall >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
            {overall}%
          </div>
          <p className="text-sm text-gray-500">Overall Attendance</p>
          <p className={`text-xs font-medium mt-1
            ${overall >= 75 ? 'text-green-600' : 'text-red-500'}`}>
            {overall >= 75 ? '✅ Good standing' : '⚠️ Below 75% threshold'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <div className="text-4xl font-bold mb-1 text-amber-500">{warningCount}</div>
          <p className="text-sm text-gray-500">Courses with Warning</p>
          <p className="text-xs text-amber-500 font-medium mt-1">60–74% attendance</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
          <div className="text-4xl font-bold mb-1 text-red-500">{dangerCount}</div>
          <p className="text-sm text-gray-500">Courses in Danger</p>
          <p className="text-xs text-red-500 font-medium mt-1">Below 60% attendance</p>
        </div>
      </div>

      {/* Per course breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Course-wise Attendance</h2>
        <div className="space-y-4">
          {summary.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{item.course?.name}</p>
                  <p className="text-xs text-gray-400">{item.course?.code}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-gray-500">
                    <span className="text-green-600 font-medium">{item.present} present</span>
                    {' · '}
                    <span className="text-red-500 font-medium">{item.absent} absent</span>
                    {' · '}
                    <span>{item.total} total</span>
                  </div>
                  <StatusBadge status={item.status}/>
                  <span className={`text-lg font-bold w-12 text-right
                    ${item.status === 'safe'    ? 'text-green-600'
                    : item.status === 'warning' ? 'text-amber-500'
                    :                             'text-red-500'}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all
                    ${item.status === 'safe'    ? 'bg-green-500'
                    : item.status === 'warning' ? 'bg-amber-400'
                    :                             'bg-red-500'}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              {/* Warning message */}
              {item.status !== 'safe' && (
                <p className={`text-xs font-medium
                  ${item.status === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
                  {item.status === 'warning'
                    ? `⚠️ You need ${Math.ceil((0.75 * item.total - item.present))} more classes to reach 75%`
                    : `🚨 Critical! You are at risk of being detained in this course`}
                </p>
              )}
            </div>
          ))}

          {summary.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No attendance records found
            </p>
          )}
        </div>
      </div>

      {/* Minimum attendance notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={14} className="text-blue-600"/>
          <p className="text-sm font-semibold text-blue-700">Attendance Policy</p>
        </div>
        <p className="text-xs text-blue-600">
          Minimum 75% attendance is required in each course to be eligible for examinations.
          Students below 60% may be detained. Contact your teacher or HOD for condoning.
        </p>
      </div>
    </div>
  );
}