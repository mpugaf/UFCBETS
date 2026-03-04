import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminPanel = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newUser.password !== newUser.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (newUser.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = newUser;
      await api.post('/admin/users', userData);

      setMessage({ type: 'success', text: 'Usuario creado exitosamente' });
      setNewUser({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al crear usuario'
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">🥊 Panel Admin</h2>
            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              ADMIN
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">

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

          {/* Create User Form */}
          <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="usuario123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.confirmPassword}
                    onChange={(e) =>
                      setNewUser({ ...newUser, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando usuario...' : 'Crear Usuario'}
              </button>
            </form>

          {/* Info Card */}
          <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="text-sm font-bold text-purple-900 mb-2">
              ℹ️ Información
            </h3>
            <ul className="space-y-1 text-purple-800 text-xs">
              <li>• Solo los administradores pueden crear nuevos usuarios</li>
              <li>• Las contraseñas deben tener al menos 6 caracteres</li>
              <li>• El registro público está deshabilitado por seguridad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
