import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { OAuthCallbackPage } from './pages/OAuthCallbackPage'
import { InvitationAcceptPage } from './pages/InvitationAcceptPage'
import { OrganizationSetupPage } from './pages/OrganizationSetupPage'
import { MainLayout } from './components/layout/MainLayout'
import { CatalogPage } from './pages/CatalogPage'
import { CatalogPageView } from './pages/CatalogPageView'
import { SelfServicePage } from './pages/SelfServicePage'
import { EnvironmentsPage } from './pages/EnvironmentsPage'
import { ActionsPage } from './pages/ActionsPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { TeamsPage } from './pages/TeamsPage'
import { UserProfilePage } from './pages/UserProfilePage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { DataModelPage } from './pages/admin/DataModelPage'
import { DataSourcesPage } from './pages/admin/DataSourcesPage'
import { AuditLogPage } from './pages/admin/AuditLogPage'
import { AutomationsPage } from './pages/admin/AutomationsPage'
import { CredentialsPage } from './pages/admin/CredentialsPage'
import { OrganizationSettingsPage } from './pages/admin/OrganizationSettingsPage'
import { UsersTeamsPage } from './pages/admin/UsersTeamsPage'
import { TenantsPage } from './pages/admin/TenantsPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/invitations/:token" element={<InvitationAcceptPage />} />

          {/* Authenticated but organization setup required */}
          <Route element={<ProtectedRoute requireOrg={false} />}>
            <Route path="/auth/setup-organization" element={<OrganizationSetupPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:pageId" element={<CatalogPageView />} />
              <Route path="/self-service" element={<SelfServicePage />} />
              <Route path="/environments" element={<EnvironmentsPage />} />
              <Route path="/actions" element={<ActionsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route path="data-model" element={<DataModelPage />} />
                <Route path="data-sources" element={<DataSourcesPage />} />
                <Route path="automations" element={<AutomationsPage />} />
                <Route path="users-teams" element={<UsersTeamsPage />} />
                <Route path="tenants" element={<TenantsPage />} />
                <Route path="audit-log" element={<AuditLogPage />} />
                <Route path="credentials" element={<CredentialsPage />} />
                <Route path="organization" element={<OrganizationSettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
