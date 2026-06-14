import { Routes, Route } from 'react-router-dom';
import AppShell      from '../../components/layout/AppShell.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import CourseDetail  from './pages/CourseDetail.jsx';
import Attendance    from './pages/Attendance.jsx';
import Grades        from './pages/Grades.jsx';
import TeacherMessages from './pages/Messages.jsx';
import SettingsPage from '../../pages/SettingsPage.jsx';

export default function TeacherLayout() {
  return (
    <AppShell>
      <Routes>
        <Route index              element={<Dashboard />}       />
        <Route path="courses"     element={<Dashboard />}       />
        <Route path="courses/:id" element={<CourseDetail />}    />
        <Route path="attendance"  element={<Attendance />}      />
        <Route path="grades"      element={<Grades />}          />
        <Route path="messages"    element={<TeacherMessages />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}