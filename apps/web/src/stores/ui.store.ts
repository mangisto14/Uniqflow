import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  sidebarOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: isDesktop,
  toasts: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  addToast: (message, type) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
