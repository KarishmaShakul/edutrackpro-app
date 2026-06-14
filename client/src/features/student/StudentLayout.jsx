import { Routes, Route } from 'react-router-dom';
import AppShell        from '../../components/layout/AppShell.jsx';
import Dashboard       from './pages/Dashboard.jsx';
import StudentCourses  from './pages/Courses.jsx';
import CourseView      from './pages/CourseView.jsx';
import StudentAttendance from './pages/Attendance.jsx';
import StudentGrades   from './pages/Grades.jsx';
import StudentMessages from './pages/Messages.jsx';
import SettingsPage from '../../pages/SettingsPage.jsx';



export default function StudentLayout() {
  return (
    <AppShell>
      <Routes>
        <Route index               element={<Dashboard />}          />
        <Route path="courses"      element={<StudentCourses />}     />
        <Route path="courses/:id"  element={<CourseView />}         />
        <Route path="attendance"   element={<StudentAttendance />}  />
        <Route path="grades"       element={<StudentGrades />}      />
        <Route path="messages"     element={<StudentMessages />}    />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}