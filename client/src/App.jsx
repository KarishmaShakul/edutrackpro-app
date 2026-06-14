import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect }     from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster }       from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { fetchMe, clearAuth } from './store/slices/authSlice.js';
import { SocketProvider } from './context/SocketContext.jsx';
import ProtectedRoute    from './components/layout/ProtectedRoute.jsx';


import LandingPage from './pages/LandingPage.jsx';
import LoginPage         from './pages/LoginPage.jsx';
import UnauthorizedPage  from './pages/UnauthorizedPage.jsx';
import AdminLayout       from './features/admin/AdminLayout.jsx';
import HodLayout         from './features/hod/HodLayout.jsx';
import TeacherLayout     from './features/teacher/TeacherLayout.jsx';
import StudentLayout     from './features/student/StudentLayout.jsx';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      refetchOnWindowFocus: false,
      staleTime:          1000 * 60 * 5, // 5 minutes
    },
  },
});

const RoleRedirect = () => {
  const { isAuth, user } = useSelector(s => s.auth);
  if (!isAuth) return <Navigate to="/" replace />;
  const map = { admin: '/admin', hod: '/hod', teacher: '/teacher', student: '/student' };
  return <Navigate to={map[user?.role] || '/login'} replace />;
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(fetchMe());
    } else {
      dispatch(clearAuth());
    }
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* Public */}
            <Route path="/"      element={<LandingPage />} />
            <Route path="/home"  element={<RoleRedirect />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Admin portal */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/*" element={<AdminLayout />} />
            </Route>

            {/* HOD portal */}
            <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
              <Route path="/hod/*" element={<HodLayout />} />
            </Route>

            {/* Teacher portal */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher/*" element={<TeacherLayout />} />
            </Route>

            {/* Student portal */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/*" element={<StudentLayout />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}