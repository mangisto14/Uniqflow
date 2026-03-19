import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider, RequireAuth } from './providers/AuthProvider'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { GalleryPage } from './features/gallery/GalleryPage'
import { ModelDetailPage } from './features/gallery/ModelDetailPage'
import { ProcessListPage } from './features/process/ProcessListPage'
import { ProcessPage } from './features/process/ProcessPage'
import { AdminPage } from './features/admin/AdminPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:id" element={<ModelDetailPage />} />
          <Route path="/processes" element={<ProcessListPage />} />
          <Route path="/processes/:id" element={<ProcessPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
