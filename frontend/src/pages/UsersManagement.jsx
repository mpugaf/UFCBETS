import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UsersManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Error loading users:', error);
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBetting = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.patch(`/users/${userId}/toggle-betting`, { can_bet: newStatus });

      // Update local state
      setUsers(users.map(u =>
        u.user_id === userId ? { ...u, can_bet: newStatus } : u
      ));

      setMessage({
        type: 'success',
        text: `Permisos de apuestas ${newStatus ? 'habilitados' : 'deshabilitados'} correctamente`
      });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error toggling user betting:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al modificar permisos'
      });
    }
  };

  const resetAllBetting = async () => {
    if (!confirm('¿Estás seguro de que quieres habilitar las apuestas para todos los usuarios?')) {
      return;
    }

    try {
      await api.post('/users/reset-all-betting');

      // Update local state
      setUsers(users.map(u =>
        u.role === 'user' ? { ...u, can_bet: true } : u
      ));

      setMessage({
        type: 'success',
        text: 'Permisos de apuestas restablecidos para todos los usuarios'
      });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error resetting betting:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al restablecer permisos'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">👥 Gestión de Usuarios</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
              <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Permisos de Apuestas</h2>
            <button
              onClick={resetAllBetting}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Habilitar Apuestas para Todos
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nickname</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total Apuestas</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acertadas</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Puntos</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Puede Apostar</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{u.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.nickname || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{u.total_bets}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{u.correct_bets}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{u.total_points}</td>
                    <td className="px-4 py-3 text-center">
                      {u.can_bet ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.role === 'user' && (
                        <button
                          onClick={() => toggleUserBetting(u.user_id, u.can_bet)}
                          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                            u.can_bet
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {u.can_bet ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                      )}
                      {u.role === 'admin' && (
                        <span className="text-gray-400 text-sm">Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
