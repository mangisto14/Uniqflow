import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Layers, Play, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '../../stores/auth.store'
import clsx from 'clsx'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gallery', icon: Layers, label: 'Model Gallery' },
  { to: '/processes', icon: Play, label: 'Processes' },
  { to: '/admin', icon: Settings, label: 'Admin' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">PM</div>
        <span className="text-lg font-semibold text-gray-900">Process Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className="mb-1 px-3 py-2">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
