import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import LoginError from './pages/LoginError';
import AdminPanel from './pages/AdminPanel';
import ProfileSettings from './pages/ProfileSettings';
import Maintainers from './pages/Maintainers';
import Betting from './pages/Betting';
import MyBets from './pages/MyBets';
import ManageRegistrationTokens from './pages/ManageRegistrationTokens';
import FighterImageManager from './pages/FighterImageManager';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login-error"
          element={
            <PublicRoute>
              <LoginError />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <ProfileSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/maintainers"
          element={
            <PrivateRoute>
              <Maintainers />
            </PrivateRoute>
          }
        />
        <Route
          path="/betting"
          element={
            <PrivateRoute>
              <Betting />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bets"
          element={
            <PrivateRoute>
              <MyBets />
            </PrivateRoute>
          }
        />
        <Route
          path="/manage-tokens"
          element={
            <PrivateRoute>
              <ManageRegistrationTokens />
            </PrivateRoute>
          }
        />
        <Route
          path="/fighter-images"
          element={
            <PrivateRoute>
              <FighterImageManager />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
