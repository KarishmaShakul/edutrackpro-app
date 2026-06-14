import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch }          from 'react-redux';
import { useAuth }              from '../../hooks/useAuth.js';
import { toggleSidebar }        from '../../store/slices/uiSlice.js';
import { logoutUser }           from '../../store/slices/authSlice.js';
import {
  GraduationCap, LayoutDashboard, Users, BookOpen,
  ClipboardList, BarChart2, MessageSquare, Settings,
  LogOut, ChevronLeft, Building2, UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_LINKS = {
  admin: [
    { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard'   },
    { to: '/admin/departments', icon: Building2,       label: 'Departments' },
    { to: '/admin/users',       icon: Users,           label: 'Users'       },
    { to: '/admin/courses',     icon: BookOpen,        label: 'Courses'     },
    { to: '/admin/messages',    icon: MessageSquare,   label: 'Messages'    },
    { to: '/admin/settings',    icon: Settings,        label: 'Settings'    },
  ],
  hod: [
    { to: '/hod',              icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hod/teachers',     icon: UserCheck,       label: 'Teachers'  },
    { to: '/hod/courses',      icon: BookOpen,        label: 'Courses'   },
    { to: '/hod/grades',       icon: BarChart2,       label: 'Grades'    },
    { to: '/hod/messages',     icon: MessageSquare,   label: 'Messages'  },
    { to: '/hod/settings',     icon: Settings,        label: 'Settings'  },
  ],
  teacher: [
    { to: '/teacher',              icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/teacher/courses',      icon: BookOpen,        label: 'My Courses' },
    { to: '/teacher/attendance',   icon: ClipboardList,   label: 'Attendance' },
    { to: '/teacher/grades',       icon: BarChart2,       label: 'Grades'     },
    { to: '/teacher/messages',     icon: MessageSquare,   label: 'Messages'   },
    { to: '/teacher/settings',     icon: Settings,        label: 'Settings'   },
  ],
  student: [
    { to: '/student',             icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/student/courses',     icon: BookOpen,        label: 'My Courses' },
    { to: '/student/attendance',  icon: ClipboardList,   label: 'Attendance' },
    { to: '/student/grades',      icon: BarChart2,       label: 'Grades'     },
    { to: '/student/messages',    icon: MessageSquare,   label: 'Messages'   },
    { to: '/student/settings',    icon: Settings,        label: 'Settings'   },
  ],
};

const ROLE_THEME = {
  admin:   { bg: 'from-purple-700 to-purple-900', accent: 'bg-purple-500', dot: 'bg-purple-300' },
  hod:     { bg: 'from-blue-700   to-blue-900',   accent: 'bg-blue-500',   dot: 'bg-blue-300'   },
  teacher: { bg: 'from-teal-700   to-teal-900',   accent: 'bg-teal-500',   dot: 'bg-teal-300'   },
  student: { bg: 'from-amber-600  to-amber-800',  accent: 'bg-amber-400',  dot: 'bg-amber-300'  },
};

export default function Sidebar({ open }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const links = NAV_LINKS[user?.role] || [];
  const theme = ROLE_THEME[user?.role] || ROLE_THEME.student;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        bg-gradient-to-b ${theme.bg}
        transition-all duration-300 ease-in-out
        ${open ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          {open && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-none">EduTrackPro</p>
              <p className="text-white/50 text-xs capitalize mt-0.5">{user?.role} portal</p>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="ml-auto text-white/60 hover:text-white lg:flex hidden"
          >
            <ChevronLeft size={18} className={`transition-transform ${!open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `/${user?.role}`}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-150 group
                ${isActive
                  ? `${theme.accent} text-white shadow-lg`
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              {open && <span className="text-sm font-medium truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/10 p-3">
          {open ? (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-white/50 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                       text-white/70 hover:bg-red-500/20 hover:text-red-300
                       transition-all duration-150"
          >
            <LogOut size={18} className="shrink-0" />
            {open && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}