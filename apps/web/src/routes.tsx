import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProcessesPage } from './features/processes/ProcessesPage';
import { BuilderPage } from './features/builder/BuilderPage';
import { ExecutionListPage } from './features/execution/ExecutionListPage';
import { ExecutionDetailPage } from './features/execution/ExecutionDetailPage';
import { TeamDashboardPage } from './features/team-dashboard/TeamDashboardPage';
import { UsersPage } from './features/admin/UsersPage';
import { TeamsPage } from './features/admin/TeamsPage';
import { SvgTemplateGallery } from './features/svg-templates/SvgTemplateGallery';
import { SvgTemplateEditPage } from './features/svg-templates/SvgTemplateEditPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="processes" element={<ProcessesPage />} />
        <Route path="processes/:id/builder" element={<BuilderPage />} />
        <Route path="executions" element={<ExecutionListPage />} />
        <Route path="executions/:id" element={<ExecutionDetailPage />} />
        <Route path="team" element={<TeamDashboardPage />} />
        <Route path="admin/users" element={<UsersPage />} />
        <Route path="admin/teams" element={<TeamsPage />} />
        <Route path="svg-templates" element={<SvgTemplateGallery />} />
        <Route path="svg-templates/:id/edit" element={<SvgTemplateEditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
