import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InvitationsManager = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, used, expired, revoked
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Form para generar invitación
  const [generateForm, setGenerateForm] = useState({
    notes: '',
    expirationDays: 7
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, filter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar invitaciones
      const invitationsRes = await api.get(`/invitations/list?status=${filter}`);
      setInvitations(invitationsRes.data.data);

      // Cargar estadísticas
      const statsRes = await api.get('/invitations/stats');
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error loading invitations:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar invitaciones'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/invitations/generate', {
        email: null,
        notes: generateForm.notes || null,
        expirationDays: parseInt(generateForm.expirationDays)
      });

      const url = res.data.data.invitation_url;

      // Intentar copiar URL al portapapeles
      try {
        await navigator.clipboard.writeText(url);
        setMessage({
          type: 'success',
          text: `✅ Token generado y URL copiada al portapapeles: ${url}`
        });
      } catch (clipboardError) {
        // Si falla el clipboard, mostrar URL para copiar manualmente
        setMessage({
          type: 'success',
          text: `✅ Token generado. Copia esta URL: ${url}`
        });
      }

      // Limpiar formulario
      setGenerateForm({
        notes: '',
        expirationDays: 7
      });

      setShowGenerateModal(false);
      loadData();
    } catch (error) {
      console.error('Error generating token:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al generar token'
      });
    }
  };

  const handleRevokeToken = async (tokenId) => {
    if (!confirm('¿Estás seguro de revocar esta invitación?')) {
      return;
    }

    try {
      await api.post(`/invitations/${tokenId}/revoke`);
      setMessage({
        type: 'success',
        text: 'Invitación revocada exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error revoking token:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al revocar invitación'
      });
    }
  };

  const copyInvitationUrl = async (token) => {
    const url = `${window.location.origin}/register/${token}`;

    try {
      await navigator.clipboard.writeText(url);
      setMessage({
        type: 'success',
        text: '✅ URL copiada al portapapeles'
      });
    } catch (error) {
      // Fallback: mostrar URL en un prompt
      prompt('Copia esta URL de invitación:', url);
      setMessage({
        type: 'success',
        text: 'Copia la URL manualmente'
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' },
      used: { text: 'Usado', class: 'bg-green-100 text-green-800' },
      expired: { text: 'Expirado', class: 'bg-red-100 text-red-800' },
      revoked: { text: 'Revocado', class: 'bg-gray-100 text-gray-800' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">🎟️ Gestión de Invitaciones</span>
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
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {message.text}
          </div>
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-600 text-sm">Total</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
              <div className="text-yellow-600 text-sm">Pendientes</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-800">{stats.used}</div>
              <div className="text-green-600 text-sm">Usados</div>
            </div>
            <div className="bg-red-50 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-red-800">{stats.expired}</div>
              <div className="text-red-600 text-sm">Expirados</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-gray-800">{stats.revoked}</div>
              <div className="text-gray-600 text-sm">Revocados</div>
            </div>
          </div>
        )}

        {/* Botón generar y filtros */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {['all', 'pending', 'used', 'expired', 'revoked'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'used' ? 'Usadas' : f === 'expired' ? 'Expiradas' : 'Revocadas'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              + Generar Invitación
            </button>
          </div>
        </div>

        {/* Lista de invitaciones */}
        {loading ? (
          <div className="text-center text-white text-xl">Cargando...</div>
        ) : invitations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay invitaciones</h2>
            <p className="text-gray-600">
              {filter === 'all' ? 'Aún no se han generado invitaciones' : `No hay invitaciones ${filter === 'pending' ? 'pendientes' : filter === 'used' ? 'usadas' : filter === 'expired' ? 'expiradas' : 'revocadas'}`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Creado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Expira</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Usado por</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Notas</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invitations.map((inv) => (
                    <tr key={inv.token_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(inv.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(inv.expires_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {inv.used_by_username ? (
                            <span className="font-medium">{inv.used_by_nickname || inv.used_by_username}</span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inv.notes || <span className="text-gray-400 italic">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {inv.status === 'pending' && (
                            <>
                              <button
                                onClick={() => copyInvitationUrl(inv.token)}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-medium"
                                title="Copiar URL"
                              >
                                📋 Copiar
                              </button>
                              <button
                                onClick={() => handleRevokeToken(inv.token_id)}
                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium"
                                title="Revocar"
                              >
                                ❌ Revocar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal generar invitación */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Generar Nueva Invitación</h2>

            <form onSubmit={handleGenerateToken} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  🔗 Se generará un link de invitación de <strong>uso único</strong>. Una vez usado, el link dejará de funcionar.
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Días de expiración
                </label>
                <select
                  value={generateForm.expirationDays}
                  onChange={(e) => setGenerateForm({ ...generateForm, expirationDays: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="1">1 día</option>
                  <option value="3">3 días</option>
                  <option value="7">7 días</option>
                  <option value="14">14 días</option>
                  <option value="30">30 días</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={generateForm.notes}
                  onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Notas sobre esta invitación..."
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  Generar Token
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsManager;
