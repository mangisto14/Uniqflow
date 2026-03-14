import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { t } from '../../i18n';

const navItems = [
  { to: '/dashboard', label: t.nav.dashboard, icon: '📊' },
  { to: '/processes', label: t.nav.processes, icon: '⚙️' },
  { to: '/executions', label: t.nav.executions, icon: '▶️' },
  { to: '/team', label: t.nav.team, icon: '👥' },
];

const adminItems = [
  { to: '/admin/users', label: t.nav.users, icon: '👤' },
  { to: '/admin/teams', label: t.nav.teams, icon: '🏢' },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  if (!sidebarOpen) return null;

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col" dir="rtl">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary-700">Uniqflow</h1>
        <p className="text-xs text-gray-400 mt-0.5">מיוחדים</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.nav.admin}</p>
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
