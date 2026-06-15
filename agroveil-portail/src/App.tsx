import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AlertsList } from './pages/alerts/AlertsList';
import { AlertDetail } from './pages/alerts/AlertDetail';
import { Reports } from './pages/Reports';
import { Subscription } from './pages/Subscription';
import { Settings } from './pages/Settings';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/alertes" element={<ProtectedRoute><AlertsList /></ProtectedRoute>} />
      <Route path="/alertes/:id" element={<ProtectedRoute><AlertDetail /></ProtectedRoute>} />
      <Route path="/rapports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/abonnement" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/parametres" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </QueryClientProvider>
  );
}
