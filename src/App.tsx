import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const CategoryDetailPage = lazy(() => import('./pages/admin/CategoryDetailPage'));
const MenuItemsPage = lazy(() => import('./pages/admin/MenuItemsPage'));
const MenuItemDetailPage = lazy(() => import('./pages/admin/MenuItemDetailPage'));
const QRCodePage = lazy(() => import('./pages/admin/QRCodePage'));
const SuperAdminDashboardPage = lazy(() => import('./pages/superadmin/DashboardPage'));
const RestaurantsPage = lazy(() => import('./pages/superadmin/RestaurantsPage'));
const RestaurantDetailPage = lazy(() => import('./pages/superadmin/RestaurantDetailPage'));
const AdminsPage = lazy(() => import('./pages/superadmin/AdminsPage'));
const PlansPage = lazy(() => import('./pages/superadmin/PlansPage'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="md" />
  </div>
);

const adminGuard = (Page: React.ComponentType) => (
  <ProtectedRoute role="ADMIN">
    <AdminLayout><Page /></AdminLayout>
  </ProtectedRoute>
);

const superGuard = (Page: React.ComponentType) => (
  <ProtectedRoute role="SUPERADMIN">
    <AdminLayout><Page /></AdminLayout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/menu/:slug" element={<MenuPage />} />

            <Route path="/admin" element={adminGuard(AdminDashboardPage)} />
            <Route path="/admin/categories" element={adminGuard(CategoriesPage)} />
            <Route path="/admin/categories/:id" element={adminGuard(CategoryDetailPage)} />
            <Route path="/admin/menu" element={adminGuard(MenuItemsPage)} />
            <Route path="/admin/menu/:id" element={adminGuard(MenuItemDetailPage)} />
            <Route path="/admin/qrcode" element={adminGuard(QRCodePage)} />

            <Route path="/superadmin" element={superGuard(SuperAdminDashboardPage)} />
            <Route path="/superadmin/restaurants" element={superGuard(RestaurantsPage)} />
            <Route path="/superadmin/restaurants/:id" element={superGuard(RestaurantDetailPage)} />
            <Route path="/superadmin/admins" element={superGuard(AdminsPage)} />
            <Route path="/superadmin/plans" element={superGuard(PlansPage)} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
