import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUIStore } from '../../stores/ui.store';

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
