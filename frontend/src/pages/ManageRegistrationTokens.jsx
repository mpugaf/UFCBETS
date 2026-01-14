import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ManageRegistrationTokens = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expiresInDays, setExpiresInDays] = useState(7);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadTokens();
  }, [user, navigate]);

  const loadTokens = async () => {
    try {
      const res = await api.get('/registration-tokens/all');
      setTokens(res.data.data);
    } catch (error) {
      console.error('Error loading tokens:', error);
      setMessage({ type: 'error', text: 'Error al cargar tokens' });
    } finally {
      setLoading(false);
    }
  };

  const createToken = async () => {
    setCreating(true);
    try {
      const res = await api.post('/registration-tokens/create', {
        expires_in_days: expiresInDays
      });
      setMessage({ type: 'success', text: 'Token creado exitosamente' });
      loadTokens();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al crear token' });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (token) => {
    const url = `${window.location.origin}/?token=${token}`;
    navigator.clipboard.writeText(url);
    setMessage({ type: 'success', text: 'URL copiada al portapapeles' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const revokeToken = async (token) => {
    if (!confirm('¿Estás seguro de revocar este token?')) return;

    try {
      await api.post(`/registration-tokens/revoke/${token}`);
      setMessage({ type: 'success', text: 'Token revocado exitosamente' });
      loadTokens();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al revocar token' });
    }
  };

  const getStats = () => {
    const total = tokens.length;
    const used = tokens.filter(t => t.is_used).length;
    const expired = tokens.filter(t => t.is_expired && !t.is_used).length;
    const available = tokens.filter(t => !t.is_used && !t.is_expired).length;
    return { total, used, expired, available };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">🔑 Gestión de Tokens</span>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-gray-600">Total Tokens</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            <div className="text-gray-600">Disponibles</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.used}</div>
            <div className="text-gray-600">Usados</div>
          </div>
          <div className="bg-red-50 rounded-lg p-6 shadow-lg">
            <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-gray-600">Expirados</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Crear Nuevo Token</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días hasta expiración
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={createToken}
              disabled={creating}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Generar Token'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
            <h2 className="text-2xl font-bold text-white">Tokens de Registro</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-600">Cargando tokens...</div>
          ) : tokens.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No hay tokens creados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado Por</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usado Por</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tokens.map((token) => (
                    <tr key={token.token_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {token.token.substring(0, 16)}...
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          token.status === 'disponible' ? 'bg-green-100 text-green-800' :
                          token.status === 'usado' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {token.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{token.creator_username}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {token.used_by_nickname || token.used_by_username || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(token.expires_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {token.status === 'disponible' && (
                          <>
                            <button
                              onClick={() => copyToClipboard(token.token)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Copiar URL
                            </button>
                            <button
                              onClick={() => revokeToken(token.token)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Revocar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRegistrationTokens;
