import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { CatalogPage } from './pages/CatalogPage'
import { SelfServicePage } from './pages/SelfServicePage'
import { EnvironmentsPage } from './pages/EnvironmentsPage'
import { ActionsPage } from './pages/ActionsPage'
import { DashboardPage } from './pages/DashboardPage'

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
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
