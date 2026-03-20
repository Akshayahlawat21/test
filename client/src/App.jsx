import { Routes, Route } from 'react-router-dom';

// Layouts
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public pages
import HomePage from './pages/public/HomePage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import PricingPage from './pages/public/PricingPage';
import CharitiesPage from './pages/public/CharitiesPage';
import CharityProfilePage from './pages/public/CharityProfilePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Dashboard pages
import OverviewPage from './pages/dashboard/OverviewPage';
import MyScoresPage from './pages/dashboard/MyScoresPage';
import MyCharityPage from './pages/dashboard/MyCharityPage';
import DrawResultsPage from './pages/dashboard/DrawResultsPage';
import WinningsPage from './pages/dashboard/WinningsPage';

// Admin pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DrawManagementPage from './pages/admin/DrawManagementPage';
import CharityManagementPage from './pages/admin/CharityManagementPage';
import WinnerVerificationPage from './pages/admin/WinnerVerificationPage';
import ReportsPage from './pages/admin/ReportsPage';

// Other
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes with shared layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/charities" element={<CharitiesPage />} />
          <Route path="/charities/:slug" element={<CharityProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Dashboard routes — protected */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/dashboard/scores" element={<MyScoresPage />} />
          <Route path="/dashboard/charity" element={<MyCharityPage />} />
          <Route path="/dashboard/draws" element={<DrawResultsPage />} />
          <Route path="/dashboard/winnings" element={<WinningsPage />} />
        </Route>

        {/* Admin routes — protected + admin only */}
        <Route
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/draws" element={<DrawManagementPage />} />
          <Route path="/admin/charities" element={<CharityManagementPage />} />
          <Route path="/admin/winners" element={<WinnerVerificationPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
        </Route>

        {/* 404 */}
        <Route element={<Layout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
