import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/processes', label: 'Processes', icon: '⚙️' },
  { to: '/executions', label: 'Executions', icon: '▶️' },
  { to: '/team', label: 'Team', icon: '👥' },
];

const ADMIN_ITEMS = [
  { to: '/admin/users', label: 'Users', icon: '👤' },
  { to: '/admin/teams', label: 'Teams', icon: '🏢' },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user && ['SUPER_ADMIN', 'ADMIN'].includes((user as { role: string }).role);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-200 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-700">
        {sidebarOpen && (
          <span className="text-lg font-bold text-primary-400">Uniqflow</span>
        )}
      </div>
      <nav className="mt-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            {sidebarOpen && (
              <p className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
            )}
            {ADMIN_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
