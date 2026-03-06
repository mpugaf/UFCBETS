import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InviteManager = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users/invite-manager');
      setUsers(res.data.data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar usuarios' });
    } finally {
      setLoading(false);
    }
  };

  const toggleInvite = async (userId, currentValue) => {
    setToggling(userId);
    try {
      const res = await api.patch(`/users/${userId}/toggle-invite`);
      const updated = res.data.data;
      setUsers(users.map(u =>
        u.user_id === userId
          ? { ...u, can_share_invite: updated.can_share_invite, invite_token: updated.invite_token ?? u.invite_token }
          : u
      ));
      setMessage({
        type: 'success',
        text: `Token de invitación ${updated.can_share_invite ? 'asignado' : 'revocado'} correctamente`
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Error al modificar token de invitación' });
    } finally {
      setToggling(null);
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
            <span className="text-2xl font-bold text-white">🎟️ Gestión de Invitaciones</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
              <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Asignar Tokens de Invitación</h2>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona qué usuarios pueden invitar a alguien más. El usuario verá su link de invitación en el Dashboard.
              Los usuarios están ordenados por puntaje total.
            </p>
          </div>

          <div className="space-y-3">
            {users.map((u, index) => (
              <div
                key={u.user_id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  u.can_share_invite
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Rank + info */}
                <div className="flex items-center gap-4">
                  <span className="text-sm w-10 text-center shrink-0 text-gray-400 font-medium">#{index + 1}</span>
                  <div>
                    <p className="font-bold text-gray-900">
                      {u.nickname || u.username}
                      <span className="text-gray-400 font-normal text-sm ml-1">@{u.username}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {u.total_points} pts · {u.correct_bets}/{u.total_bets} aciertos
                    </p>
                  </div>
                </div>

                {/* Checkbox + estado */}
                <div className="flex items-center gap-4">
                  {u.can_share_invite && (
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                      Puede invitar
                    </span>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!u.can_share_invite}
                      disabled={toggling === u.user_id}
                      onChange={() => toggleInvite(u.user_id, u.can_share_invite)}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center text-gray-400 py-8">No hay usuarios registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteManager;
