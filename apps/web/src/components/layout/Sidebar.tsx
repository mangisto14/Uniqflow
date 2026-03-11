import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../stores/ui.store';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/processes', label: 'Processes', icon: '⚙️' },
  { to: '/executions', label: 'Executions', icon: '▶️' },
  { to: '/team', label: 'Team', icon: '👥' },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

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
      </nav>
    </aside>
  );
}
