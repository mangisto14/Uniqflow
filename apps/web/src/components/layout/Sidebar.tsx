import { NavLink, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';

interface NavItem { to: string; label: string; icon: string }

const navItems: NavItem[] = [
  { to: '/dashboard',     label: t.nav.dashboard,       icon: '📊' },
  { to: '/processes',     label: t.nav.processes,        icon: '⚙️' },
  { to: '/executions',    label: t.nav.executions,       icon: '▶️' },
  { to: '/team',          label: t.nav.team,             icon: '👥' },
  { to: '/svg-templates', label: t.svgTemplates.title,  icon: '🗺️' },
];

const adminItems: NavItem[] = [
  { to: '/admin/users', label: t.nav.users, icon: '👤' },
  { to: '/admin/teams', label: t.nav.teams, icon: '🏢' },
];

export function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const collapsed = !sidebarOpen;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      dir="rtl"
      className={`
        fixed top-0 right-0 h-full z-40
        bg-white border-l border-gray-100
        flex flex-col select-none
        transition-all duration-300 ease-in-out
        shadow-2xl lg:shadow-none
        ${sidebarOpen
          ? 'w-64 translate-x-0'
          : 'w-64 translate-x-full lg:translate-x-0 lg:w-16'
        }
      `}
    >
      {/* ── Logo header ── */}
      <div className={`flex items-center border-b border-gray-100 h-16 flex-shrink-0
        ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl
          flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-sm font-bold">U</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Uniqflow</h1>
            <p className="text-[11px] text-gray-400">מיוחדים</p>
          </div>
        )}
        {/* Close button — visible only on mobile */}
        {!collapsed && (
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="סגור תפריט"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <ul className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>

        {isAdmin && (
          <div className="mt-5">
            <div className={`mb-1.5 ${collapsed ? 'px-2' : 'px-4'}`}>
              {collapsed
                ? <div className="h-px bg-gray-100" />
                : <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{t.nav.admin}</p>
              }
            </div>
            <ul className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
              {adminItems.map((item) => (
                <li key={item.to}>
                  <SidebarLink item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* ── User footer ── */}
      <div className={`border-t border-gray-100 flex-shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <UserAvatar name={user?.name} />
            <LogoutButton onLogout={handleLogout} label={t.topBar.logout} />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <UserAvatar name={user?.name} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email}</p>
            </div>
            <LogoutButton onLogout={handleLogout} label={t.topBar.logout} />
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center rounded-xl text-sm font-medium transition-all duration-150
        ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
        ${isActive
          ? 'bg-primary-50 text-primary-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <span className="text-base leading-none flex-shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function UserAvatar({ name }: { name?: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
      flex items-center justify-center flex-shrink-0 shadow-sm">
      <span className="text-white text-xs font-bold">{name?.charAt(0) ?? '?'}</span>
    </div>
  );
}

function LogoutButton({ onLogout, label }: { onLogout: () => void; label: string }) {
  return (
    <button
      onClick={onLogout}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
      title={label}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  );
}
