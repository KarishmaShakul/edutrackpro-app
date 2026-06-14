import { useState }    from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { CheckCircle, XCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { courseApi, attendanceApi } from '../../../api/index.js';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  present: { icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50  border-green-200',  label: 'Present'  },
  absent:  { icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50    border-red-200',    label: 'Absent'   },
  late:    { icon: Clock,       color: 'text-amber-500',  bg: 'bg-amber-50  border-amber-200',  label: 'Late'     },
  excused: { icon: AlertCircle, color: 'text-blue-500',   bg: 'bg-blue-50   border-blue-200',   label: 'Excused'  },
};

export default function Attendance() {
  const user = useSelector(s => s.auth.user);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date,   setDate]   = useState(new Date().toISOString().split('T')[0]);
  const [topic,  setTopic]  = useState('');
  const [roster, setRoster] = useState({}); // studentId → status

  const { data: coursesData } = useQuery({
    queryKey: ['courses','teacher'],
    queryFn:  () => courseApi.getAll().then(r => r.data.data),
  });

  const { data: courseDetail } = useQuery({
    queryKey: ['course', selectedCourse],
    queryFn:  () => courseApi.getById(selectedCourse).then(r => r.data.data),
    enabled:  !!selectedCourse,
    onSuccess: (data) => {
      // Init all students as absent
      const init = {};
      data.students?.forEach(s => { init[s._id] = 'absent'; });
      setRoster(init);
    },
  });

  const markMutation = useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess:  () => toast.success('Attendance marked successfully!'),
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const courses  = coursesData?.courses || [];
  const students = courseDetail?.students || [];

  const setStatus = (studentId, status) => {
    setRoster(r => ({ ...r, [studentId]: status }));
  };

  const markAll = (status) => {
    const all = {};
    students.forEach(s => { all[s._id] = status; });
    setRoster(all);
  };

  const handleSubmit = () => {
    if (!selectedCourse) return toast.error('Select a course');
    const records = Object.entries(roster).map(([student, status]) => ({ student, status }));
    markMutation.mutate({ courseId: selectedCourse, date, topic, records });
  };

  const counts = {
    present: Object.values(roster).filter(s => s === 'present').length,
    absent:  Object.values(roster).filter(s => s === 'absent').length,
    late:    Object.values(roster).filter(s => s === 'late').length,
    excused: Object.values(roster).filter(s => s === 'excused').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Record attendance for your class sessions</p>
      </div>

      {/* Session setup */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Session details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-400">
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-400"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Topic covered</label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Binary Trees"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-400"/>
          </div>
        </div>
      </div>

      {/* Roster */}
      {selectedCourse && students.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Student Roster</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {students.length} students · P:{counts.present} A:{counts.absent} L:{counts.late} E:{counts.excused}
              </p>
            </div>
            {/* Bulk actions */}
            <div className="flex gap-2">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                <button key={status} onClick={() => markAll(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${cfg.bg} ${cfg.color}`}>
                  All {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {students.map((student, idx) => {
              const currentStatus = roster[student._id] || 'absent';
              return (
                <div key={student._id}
                  className="flex items-center justify-between p-4 border border-gray-100
                             rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-6 text-center">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700
                                    flex items-center justify-center text-xs font-bold">
                      {student.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.rollNumber} · Sec {student.section}</p>
                    </div>
                  </div>

                  {/* Status buttons */}
                  <div className="flex gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                      const Icon = cfg.icon;
                      const isActive = currentStatus === status;
                      return (
                        <button key={status}
                          onClick={() => setStatus(student._id, status)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs
                                     font-medium transition-all
                                     ${isActive
                                       ? `${cfg.bg} ${cfg.color} shadow-sm`
                                       : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                          <Icon size={13}/>
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary + submit */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                <span key={status} className={`flex items-center gap-1 font-medium ${cfg.color}`}>
                  {counts[status]} {cfg.label}
                </span>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={markMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white
                         rounded-xl hover:bg-teal-700 transition-colors font-medium text-sm
                         disabled:opacity-60">
              <Save size={16}/>
              {markMutation.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      {selectedCourse && students.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400">No students enrolled in this course</p>
        </div>
      )}

      {!selectedCourse && (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <p className="text-gray-400">Select a course above to load the student roster</p>
        </div>
      )}
    </div>
  );
}