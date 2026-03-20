import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUIStore } from '../../stores/ui.store';

export function AppShell() {
  const { sidebarOpen, closeSidebar } = useUIStore();

  // Auto-close sidebar when resizing to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, closeSidebar]);

  return (
    // dir="rtl" → flex goes right-to-left → Sidebar (first child) anchors to RIGHT side
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">

      {/* Mobile backdrop — tap outside sidebar to close */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — first in RTL flex = RIGHT side of screen */}
      <Sidebar />

      {/* Main content — on desktop offset by sidebar width */}
      <div
        className={`
          flex-1 flex flex-col overflow-hidden min-w-0
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:mr-64' : 'lg:mr-16'}
        `}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
