import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { RoutinePage } from './pages/RoutinePage';
import { TreatmentsPage } from './pages/TreatmentsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProfilePage } from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const darkMode = useSettingsStore((state) => state.darkMode);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#374151' : '#fff',
            color: darkMode ? '#fff' : '#000',
          },
        }}
      />
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <Auth />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoutinePage />} />
          <Route path="treatments" element={<TreatmentsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
