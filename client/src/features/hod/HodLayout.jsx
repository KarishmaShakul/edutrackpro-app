import { Routes, Route } from 'react-router-dom';
import AppShell    from '../../components/layout/AppShell.jsx';
import Dashboard   from './pages/Dashboard.jsx';
import Teachers    from './pages/Teachers.jsx';
import HodCourses  from './pages/Courses.jsx';
import GradeReport from './pages/GradeReport.jsx';
import HodMessages from './pages/Messages.jsx';
import SettingsPage from '../../pages/SettingsPage.jsx';



export default function HodLayout() {
  return (
    <AppShell>
      <Routes>
        <Route index            element={<Dashboard />}   />
        <Route path="teachers"  element={<Teachers />}    />
        <Route path="courses"   element={<HodCourses />}  />
        <Route path="grades"    element={<GradeReport />} />
        <Route path="messages"  element={<HodMessages />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}