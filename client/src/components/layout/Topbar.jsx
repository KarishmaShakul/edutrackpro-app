import { useSelector, useDispatch } from 'react-redux';
import { useNavigate }              from 'react-router-dom';
import { useState }                 from 'react';
import {
  Menu, Bell, MessageSquare,
  Search, Wifi, WifiOff,
} from 'lucide-react';
import { toggleSidebar, toggleNotifPanel } from '../../store/slices/uiSlice.js';
import { useAuth } from '../../hooks/useAuth.js';

const ROLE_LABEL = {
  admin:   { label: 'Admin Portal',              color: 'bg-purple-100 text-purple-700' },
  hod:     { label: 'Head of Department Portal', color: 'bg-blue-100 text-blue-700'   },
  teacher: { label: 'Teacher Portal',            color: 'bg-teal-100 text-teal-700'   },
  student: { label: 'Student Portal',            color: 'bg-amber-100 text-amber-700' },
};

export default function Topbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const unreadMsg   = useSelector(s => s.ui.unreadMessageCount);
  const unreadNotif = useSelector(s => s.ui.unreadNotifCount);
  const connected   = useSelector(s => s.socket.connected);
  const [search, setSearch] = useState('');

  const roleInfo = ROLE_LABEL[user?.role] || ROLE_LABEL.student;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 sticky top-0 z-10 shadow-sm">

      {/* Hamburger */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Portal label */}
      <span className={`hidden sm:inline-flex text-xs font-semibold px-3 py-1 rounded-full ${roleInfo.color}`}>
        {roleInfo.label}
      </span>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200
                     rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300
                     focus:bg-white transition-all"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">

        {/* Socket connection indicator */}
        <div title={connected ? 'Connected' : 'Disconnected'}
          className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}
        />

        {/* Messages */}
        <button
          onClick={() => navigate(`/${user?.role}/messages`)}
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <MessageSquare size={20} />
          {unreadMsg > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white
                             text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadMsg > 9 ? '9+' : unreadMsg}
            </span>
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => dispatch(toggleNotifPanel())}
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Bell size={20} />
          {unreadNotif > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white
                             text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadNotif > 9 ? '9+' : unreadNotif}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate(`/${user?.role}/settings`)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500
                     flex items-center justify-center text-white text-sm font-bold
                     hover:opacity-90 transition-opacity ml-1"
        >
          {user?.name?.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}