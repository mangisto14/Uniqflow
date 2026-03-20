import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { t } from '../../i18n';

// Map routes to page titles
const pageTitles: Record<string, string> = {
  '/dashboard':    t.nav.dashboard,
  '/processes':    t.nav.processes,
  '/executions':   t.nav.executions,
  '/team':         t.nav.team,
  '/svg-templates': t.svgTemplates.title,
  '/admin/users':  t.nav.users,
  '/admin/teams':  t.nav.teams,
};

export function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Uniqflow';

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'מנהל ראשי',
    ADMIN: 'מנהל',
    MANAGER: 'מנהל תהליכים',
    EDITOR: 'עורך',
    VIEWER: 'צופה',
  };

  return (
    <header
      dir="rtl"
      className="h-16 bg-white border-b border-gray-100 flex items-center gap-3 px-4 md:px-6 flex-shrink-0 shadow-sm z-20 relative"
    >
      {/* Hamburger — toggles sidebar */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100
          transition-colors flex-shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
        aria-label={t.topBar.toggleSidebar}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <h2 className="text-base font-semibold text-gray-800 flex-1 truncate hidden xs:block">
        {pageTitle}
      </h2>

      {/* App name on mobile when title hidden */}
      <span className="text-sm font-bold text-primary-600 xs:hidden flex-1 text-center">
        Uniqflow
      </span>

      {/* Right side: user chip */}
      {user && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-gray-800">{user.name}</span>
            <span className="text-[11px] text-gray-400">
              {roleLabel[user.role] ?? user.role}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
            flex items-center justify-center flex-shrink-0 shadow-sm cursor-default"
            title={user.name}
          >
            <span className="text-white text-xs font-bold">{user.name?.charAt(0)}</span>
          </div>
        </div>
      )}
    </header>
  );
}
