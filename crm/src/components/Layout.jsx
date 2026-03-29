import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiSquares2X2, HiBookOpen, HiUsers, HiAcademicCap, HiArrowLeftOnRectangle,
} from 'react-icons/hi2';

const ROLE_COLORS = {
  ADMIN: 'bg-rose-100 text-rose-700',
  ADMISSION_OFFICER: 'bg-blue-100 text-blue-700',
  MANAGEMENT: 'bg-emerald-100 text-emerald-700',
};

const NAV = [
  { path: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT'], icon: <HiSquares2X2 className="w-4 h-4" /> },
  { path: '/programs',  label: 'Programs',  roles: ['ADMIN', 'ADMISSION_OFFICER'],               icon: <HiBookOpen    className="w-4 h-4" /> },
  { path: '/applicants',label: 'Applicants',roles: ['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT'], icon: <HiUsers       className="w-4 h-4" /> },
];

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { signOut(); navigate('/login'); };
  const navItems = NAV.filter((n) => n.roles.includes(user?.role));
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <HiAcademicCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">EduMerge CRM</h1>
              <p className="text-xs text-slate-400">Admissions Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{user?.name}</p>
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded-md font-medium mt-0.5 ${ROLE_COLORS[user?.role]}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
            >
              <HiArrowLeftOnRectangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
