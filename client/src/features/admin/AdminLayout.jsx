import { Routes, Route } from 'react-router-dom';
import AppShell      from '../../components/layout/AppShell.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import Departments   from './pages/Departments.jsx';
import Users         from './pages/Users.jsx';
import AdminCourses  from './pages/Courses.jsx';
import AdminMessages from './pages/Messages.jsx';
import SettingsPage  from '../../pages/SettingsPage.jsx';

export default function AdminLayout() {
  return (
    <AppShell>
      <Routes>
        <Route index              element={<Dashboard />}    />
        <Route path="departments" element={<Departments />}  />
        <Route path="users"       element={<Users />}        />
        <Route path="courses"     element={<AdminCourses />} />
        <Route path="messages"    element={<AdminMessages />} />
        <Route path="settings"    element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
