import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { CatalogPage } from './pages/CatalogPage'
import { SelfServicePage } from './pages/SelfServicePage'
import { EnvironmentsPage } from './pages/EnvironmentsPage'
import { ActionsPage } from './pages/ActionsPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { TeamsPage } from './pages/TeamsPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { DataModelPage } from './pages/admin/DataModelPage'
import { DataSourcesPage } from './pages/admin/DataSourcesPage'
import { AuditLogPage } from './pages/admin/AuditLogPage'
import { AutomationsPage } from './pages/admin/AutomationsPage'
import { CredentialsPage } from './pages/admin/CredentialsPage'
import { OrganizationSettingsPage } from './pages/admin/OrganizationSettingsPage'
import { UsersTeamsPage } from './pages/admin/UsersTeamsPage'

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
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
            <Route path="audit-log" element={<AuditLogPage />} />
            <Route path="credentials" element={<CredentialsPage />} />
            <Route path="organization" element={<OrganizationSettingsPage />} />
          </Route>
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
