import { useUIStore } from '../../stores/ui.store';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';

export function TopBar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm" dir="rtl">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        aria-label={t.topBar.toggleSidebar}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-right">
              <p className="font-medium text-gray-700">{user.name}</p>
              <p className="text-gray-500 text-xs">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t.topBar.logout}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
