import { useState }    from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Send } from 'lucide-react';
import { courseApi, gradeApi } from '../../../api/index.js';
import toast from 'react-hot-toast';

export default function Grades() {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [gradeInputs, setGradeInputs] = useState({});

  const { data: coursesData } = useQuery({
    queryKey: ['courses','teacher'],
    queryFn:  () => courseApi.getAll().then(r => r.data.data),
  });

  const { data: courseDetail } = useQuery({
    queryKey: ['course', selectedCourse],
    queryFn:  () => courseApi.getById(selectedCourse).then(r => r.data.data),
    enabled:  !!selectedCourse,
    onSuccess: (data) => {
      const init = {};
      data.students?.forEach(s => {
        init[s._id] = { internal: 0, external: 0, assignment: 0 };
      });
      setGradeInputs(init);
    },
  });

  const { data: existingGrades } = useQuery({
    queryKey: ['grades', selectedCourse],
    queryFn:  () => gradeApi.getByCourse(selectedCourse).then(r => r.data.data),
    enabled:  !!selectedCourse,
    onSuccess: (grades) => {
      const filled = {};
      grades.forEach(g => {
        filled[g.student._id] = {
          internal:   g.internal?.marks   || 0,
          external:   g.external?.marks   || 0,
          assignment: g.assignment?.marks || 0,
        };
      });
      setGradeInputs(prev => ({ ...prev, ...filled }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: gradeApi.upsert,
    onSuccess:  () => toast.success('Grade saved'),
    onError:    (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const publishMutation = useMutation({
    mutationFn: () => gradeApi.publish(selectedCourse),
    onSuccess:  () => {
      toast.success('Grades published! Students notified.');
      qc.invalidateQueries({ queryKey: ['grades', selectedCourse] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const courses  = coursesData?.courses || [];
  const students = courseDetail?.students || [];

  const updateInput = (studentId, field, value) => {
    setGradeInputs(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: Number(value) },
    }));
  };

  const saveGrade = (studentId) => {
    const g = gradeInputs[studentId] || {};
    saveMutation.mutate({
      studentId,
      courseId:   selectedCourse,
      internal:   { marks: g.internal   || 0, maxMarks: 40 },
      external:   { marks: g.external   || 0, maxMarks: 60 },
      assignment: { marks: g.assignment || 0, maxMarks: 20 },
    });
  };

  const calcTotal = (studentId) => {
    const g = gradeInputs[studentId] || {};
    return (g.internal || 0) + (g.external || 0) + (g.assignment || 0);
  };

  const calcGrade = (total) => {
    const p = (total / 120) * 100;
    if (p >= 90) return { grade: 'O',  color: 'text-purple-600' };
    if (p >= 80) return { grade: 'A+', color: 'text-blue-600'   };
    if (p >= 70) return { grade: 'A',  color: 'text-teal-600'   };
    if (p >= 60) return { grade: 'B+', color: 'text-green-600'  };
    if (p >= 50) return { grade: 'B',  color: 'text-amber-600'  };
    if (p >= 40) return { grade: 'C',  color: 'text-orange-500' };
    if (p  >  0) return { grade: 'F',  color: 'text-red-600'    };
    return { grade: 'I', color: 'text-gray-400' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Enter Grades</h1>
        <p className="text-gray-500 text-sm mt-1">Internal (40) + External (60) + Assignment (20) = 120 marks</p>
      </div>

      {/* Course selector */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Select Course</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-teal-400">
          <option value="">Choose a course</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      {/* Grade table */}
      {selectedCourse && students.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-800">
              Grade Sheet — {courseDetail?.name}
            </h2>
            <button
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white
                         rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium
                         disabled:opacity-60">
              <Send size={14}/>
              {publishMutation.isPending ? 'Publishing...' : 'Publish All Grades'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium text-center">Internal /40</th>
                  <th className="pb-3 font-medium text-center">External /60</th>
                  <th className="pb-3 font-medium text-center">Assignment /20</th>
                  <th className="pb-3 font-medium text-center">Total /120</th>
                  <th className="pb-3 font-medium text-center">Grade</th>
                  <th className="pb-3 font-medium text-center">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student, idx) => {
                  const g     = gradeInputs[student._id] || {};
                  const total = calcTotal(student._id);
                  const { grade, color } = calcGrade(total);

                  return (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700
                                          flex items-center justify-center text-xs font-bold">
                            {student.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-400">{student.rollNumber}</p>
                          </div>
                        </div>
                      </td>

                      {/* Internal */}
                      <td className="py-3 text-center">
                        <input
                          type="number" min={0} max={40}
                          value={g.internal || 0}
                          onChange={e => updateInput(student._id, 'internal', e.target.value)}
                          className="w-16 text-center px-2 py-1.5 border border-gray-200
                                     rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"/>
                      </td>

                      {/* External */}
                      <td className="py-3 text-center">
                        <input
                          type="number" min={0} max={60}
                          value={g.external || 0}
                          onChange={e => updateInput(student._id, 'external', e.target.value)}
                          className="w-16 text-center px-2 py-1.5 border border-gray-200
                                     rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"/>
                      </td>

                      {/* Assignment */}
                      <td className="py-3 text-center">
                        <input
                          type="number" min={0} max={20}
                          value={g.assignment || 0}
                          onChange={e => updateInput(student._id, 'assignment', e.target.value)}
                          className="w-16 text-center px-2 py-1.5 border border-gray-200
                                     rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"/>
                      </td>

                      {/* Total */}
                      <td className="py-3 text-center">
                        <span className="font-bold text-gray-800">{total}</span>
                        <span className="text-gray-400 text-xs">/120</span>
                      </td>

                      {/* Grade */}
                      <td className="py-3 text-center">
                        <span className={`font-bold text-lg ${color}`}>{grade}</span>
                      </td>

                      {/* Save */}
                      <td className="py-3 text-center">
                        <button onClick={() => saveGrade(student._id)}
                          className="p-1.5 bg-teal-50 text-teal-600 rounded-lg
                                     hover:bg-teal-100 transition-colors">
                          <Save size={14}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCourse && students.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-gray-400">No students enrolled in this course</p>
        </div>
      )}

      {!selectedCourse && (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <p className="text-gray-400">Select a course above to start entering grades</p>
        </div>
      )}
    </div>
  );
}