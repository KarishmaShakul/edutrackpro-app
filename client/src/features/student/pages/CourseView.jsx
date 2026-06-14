import { useState }    from 'react';
import { useParams }   from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  BookOpen, FileText, Video, Link as LinkIcon,
  ClipboardList, Upload, Calendar,
} from 'lucide-react';
import { courseApi }   from '../../../api/index.js';
import toast           from 'react-hot-toast';

const TYPE_ICON = { pdf: FileText, video: Video, link: LinkIcon, other: FileText };

export default function CourseView() {
  const { id }  = useParams();
  const user    = useSelector(s => s.auth.user);
  const [tab, setTab] = useState('overview');

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn:  () => courseApi.getById(id).then(r => r.data.data),
  });

  const submitMutation = useMutation({
    mutationFn: ({ asgId, fileUrl }) => courseApi.submitAssignment(id, asgId, { fileUrl }),
    onSuccess:  () => toast.success('Assignment submitted!'),
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!course) return <div className="text-center py-20 text-gray-400">Course not found</div>;

  const tabs = ['overview', 'materials', 'assignments'];

  const isSubmitted = (asg) =>
    asg.submissions?.some(s => s.student === user?._id || s.student?._id === user?._id);

  const isPastDue = (dueDate) => new Date() > new Date(dueDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen size={26} className="text-white"/>
          </div>
          <div>
            <h1 className="text-xl font-bold">{course.name}</h1>
            <p className="text-amber-100 text-sm">
              {course.code} · {course.teacher?.name} · {course.credits} credits · Sem {course.semester}
            </p>
            {course.department?.name && (
              <p className="text-amber-200 text-xs mt-1">{course.department.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${tab === t ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">About this course</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {course.description || 'No description provided yet.'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Materials</p>
                <p className="font-semibold text-gray-800">{course.materials?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Assignments</p>
                <p className="font-semibold text-gray-800">{course.assignments?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Section</p>
                <p className="font-semibold text-gray-800">{course.section || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Students</p>
                <p className="font-semibold text-gray-800">{course.students?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">Schedule</h2>
            {course.schedule?.length > 0 ? (
              <div className="space-y-2">
                {course.schedule.map((slot, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{slot.day}</span>
                    <span className="text-gray-500">{slot.startTime} – {slot.endTime}</span>
                    <span className="text-gray-400 text-xs">{slot.room || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No schedule posted yet</p>
            )}
          </div>
        </div>
      )}

      {/* Materials */}
      {tab === 'materials' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            Course Materials ({course.materials?.length || 0})
          </h2>
          <div className="space-y-3">
            {course.materials?.map(mat => {
              const Icon = TYPE_ICON[mat.type] || FileText;
              return (
                <a key={mat._id} href={mat.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl
                             hover:bg-amber-50 hover:border-amber-200 transition-all group">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-amber-600"/>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 group-hover:text-amber-700 transition-colors">
                      {mat.title}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{mat.type}</p>
                  </div>
                  <span className="text-xs text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open →
                  </span>
                </a>
              );
            })}
            {!course.materials?.length && (
              <p className="text-center text-gray-400 py-8">No materials uploaded yet</p>
            )}
          </div>
        </div>
      )}

      {/* Assignments */}
      {tab === 'assignments' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            Assignments ({course.assignments?.length || 0})
          </h2>
          <div className="space-y-4">
            {course.assignments?.filter(a => a.isPublished).map(asg => {
              const submitted = isSubmitted(asg);
              const pastDue   = isPastDue(asg.dueDate);
              return (
                <div key={asg._id}
                  className={`p-5 border rounded-2xl transition-colors
                    ${submitted ? 'border-green-200 bg-green-50'
                    : pastDue   ? 'border-red-200   bg-red-50'
                    :             'border-gray-100  bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{asg.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{asg.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11}/>
                          Due: {new Date(asg.dueDate).toLocaleDateString()}
                        </span>
                        <span>Max: {asg.maxMarks} marks</span>
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      {submitted ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium
                                         bg-green-100 px-3 py-1.5 rounded-xl">
                          ✅ Submitted
                        </span>
                      ) : pastDue ? (
                        <span className="text-red-500 text-sm font-medium bg-red-100 px-3 py-1.5 rounded-xl">
                          ⏰ Past due
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const url = prompt('Enter your submission URL (Google Drive, etc.):');
                            if (url) submitMutation.mutate({ asgId: asg._id, fileUrl: url });
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white
                                     rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium">
                          <Upload size={14}/> Submit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {!course.assignments?.filter(a => a.isPublished).length && (
              <p className="text-center text-gray-400 py-8">No assignments yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}