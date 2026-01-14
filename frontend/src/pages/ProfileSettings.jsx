import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al cambiar contraseña'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">⚙️ Configuración</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-white/80 font-medium transition"
              >
                Dashboard
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-white hover:text-white/80 font-medium transition"
                >
                  Panel Admin
                </button>
              )}
              <div className="text-white text-right">
                <p className="font-semibold">{user?.username}</p>
                <p className="text-sm text-white/70">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Info Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Usuario
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <p className="text-lg font-semibold text-gray-800">{user?.username}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">El nombre de usuario no se puede modificar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Rol
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <p className="text-lg font-semibold text-gray-800 capitalize">{user?.role}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Puntos Totales
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <p className="text-lg font-semibold text-purple-600">{user?.total_points || 0}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Miembro desde
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <p className="text-lg font-semibold text-gray-800">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cambiar Contraseña</h2>

          {message.text && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={passwords.confirmNewPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmNewPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/30">
          <h3 className="text-lg font-bold text-white mb-2">
            🔒 Seguridad
          </h3>
          <ul className="space-y-1 text-white/90 text-sm">
            <li>• Tu nombre de usuario es único y no puede modificarse</li>
            <li>• Usa una contraseña segura con al menos 6 caracteres</li>
            <li>• Cambia tu contraseña regularmente para mayor seguridad</li>
            <li>• No compartas tus credenciales con nadie</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
