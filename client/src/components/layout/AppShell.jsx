import { useSelector } from 'react-redux';
import Sidebar           from './Sidebar.jsx';
import Topbar            from './Topbar.jsx';
import NotificationPanel from './NotificationPanel.jsx';

export default function AppShell({ children }) {
  const sidebarOpen = useSelector(s => s.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar open={sidebarOpen} />

      {/* Main content — shifts right when sidebar is open */}
      <div className={`flex-1 flex flex-col transition-all duration-300
                       ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      <NotificationPanel />
    </div>
  );
}