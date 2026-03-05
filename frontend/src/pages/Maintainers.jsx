import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Maintainers = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fighters');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [catalogs, setCatalogs] = useState({});
  const [fighters, setFighters] = useState([]);
  const [events, setEvents] = useState([]);
  const [fights, setFights] = useState([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState('');

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserEvent, setSelectedUserEvent] = useState('');
  const [userBets, setUserBets] = useState([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [confirmingDeleteUser, setConfirmingDeleteUser] = useState(null);

  const [bettingConfig, setBettingConfig] = useState({ betting_enabled: false, current_event_id: 0 });

  const [editingFight, setEditingFight] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fighter search & edit
  const [fighterSearch, setFighterSearch] = useState('');
  const [editingFighter, setEditingFighter] = useState(null);
  const [showEditFighterModal, setShowEditFighterModal] = useState(false);

  // Event Details Modal
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [eventDetailsFights, setEventDetailsFights] = useState([]);
  const [loadingEventDetails, setLoadingEventDetails] = useState(false);

  // Registration Tokens
  const [registrationTokens, setRegistrationTokens] = useState([]);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [creatingToken, setCreatingToken] = useState(false);

  useEffect(() => {
    loadCatalogs();
    loadData();
    loadConfig();
    loadUsers();
    loadRegistrationTokens();
  }, []);

  useEffect(() => {
    if (selectedUser && selectedUserEvent && selectedUser !== 'all') {
      loadUserBets(selectedUser, selectedUserEvent);
    } else {
      setUserBets([]);
    }
  }, [selectedUser, selectedUserEvent]);

  const loadCatalogs = async () => {
    try {
      const res = await api.get('/maintainers/catalogs');
      setCatalogs(res.data.data);
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const loadConfig = async () => {
    try {
      const res = await api.get('/config/betting-status');
      setBettingConfig(res.data.data);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadData = async () => {
    try {
      const [fightersRes, eventsRes, fightsRes] = await Promise.all([
        api.get('/maintainers/fighters'),
        api.get('/maintainers/events'),
        api.get('/maintainers/fights')
      ]);
      setFighters(fightersRes.data.data);
      setEvents(eventsRes.data.data);
      setFights(fightsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/maintainers/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserBets = async (userId, eventId) => {
    try {
      setLoading(true);
      const res = await api.get(`/maintainers/user-bets/${userId}/${eventId}`);
      setUserBets(res.data.data);
    } catch (error) {
      console.error('Error loading user bets:', error);
      setUserBets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearUserBets = async () => {
    setShowConfirmClear(false);
    setLoading(true);
    try {
      const res = await api.post('/maintainers/clear-user-bets', {
        userId: selectedUser,
        eventId: selectedUserEvent
      });
      setMessage({ type: 'success', text: res.data.message });
      setUserBets([]);
      setSelectedUser('');
      setSelectedUserEvent('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al limpiar apuestas' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setLoading(true);
    try {
      const newStatus = !currentStatus;
      await api.patch(`/maintainers/users/${userId}/toggle-status`, { is_active: newStatus });
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_active: newStatus } : u));
      setMessage({ type: 'success', text: `Cuenta ${newStatus ? 'habilitada' : 'deshabilitada'} correctamente` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al modificar estado del usuario' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (confirmingDeleteUser !== userId) {
      setConfirmingDeleteUser(userId);
      return;
    }

    setLoading(true);
    try {
      const res = await api.delete(`/maintainers/users/${userId}`);
      setMessage({ type: 'success', text: res.data.message });
      setConfirmingDeleteUser(null);
      loadUsers();
      if (selectedUser === userId.toString()) {
        setSelectedUser('');
        setSelectedUserEvent('');
        setUserBets([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar usuario' });
    } finally {
      setLoading(false);
    }
  };

  const toggleBetting = async () => {
    try {
      const newValue = !bettingConfig.betting_enabled;
      await api.post('/config', { key: 'betting_enabled', value: newValue.toString() });
      setBettingConfig({ ...bettingConfig, betting_enabled: newValue });
      setMessage({ type: 'success', text: `Apuestas ${newValue ? 'habilitadas' : 'deshabilitadas'}` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al cambiar configuración' });
    }
  };

  const handleViewEventDetails = async (eventId) => {
    try {
      setLoadingEventDetails(true);
      setShowEventDetailsModal(true);

      // Get event details
      const eventRes = await api.get(`/maintainers/events/${eventId}`);
      setSelectedEventDetails(eventRes.data.data);

      // Get fights for this event
      const fightsRes = await api.get(`/maintainers/fights?event_id=${eventId}`);
      setEventDetailsFights(fightsRes.data.data);
    } catch (error) {
      console.error('Error loading event details:', error);
      setMessage({ type: 'error', text: 'Error al cargar detalles del evento' });
    } finally {
      setLoadingEventDetails(false);
    }
  };

  const closeEventDetailsModal = () => {
    setShowEventDetailsModal(false);
    setSelectedEventDetails(null);
    setEventDetailsFights([]);
  };

  const loadRegistrationTokens = async () => {
    try {
      const res = await api.get('/registration-tokens/all');
      setRegistrationTokens(res.data.data);
    } catch (error) {
      console.error('Error loading registration tokens:', error);
    }
  };

  const createRegistrationToken = async () => {
    setCreatingToken(true);
    try {
      const res = await api.post('/registration-tokens/create', {
        expires_in_days: expiresInDays
      });
      setMessage({ type: 'success', text: 'Token creado exitosamente' });
      loadRegistrationTokens();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al crear token' });
    } finally {
      setCreatingToken(false);
    }
  };

  const copyTokenUrl = (token) => {
    const url = `${window.location.origin}/?token=${token}`;

    // Método alternativo más compatible
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setMessage({ type: 'success', text: 'URL copiada al portapapeles' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Error al copiar URL' });
      }
    } catch (err) {
      console.error('Error al copiar:', err);
      setMessage({ type: 'error', text: 'Error al copiar URL' });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const deleteRegistrationToken = async (tokenId) => {
    if (!confirm('¿Estás seguro de eliminar este token? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/registration-tokens/${tokenId}`);
      setRegistrationTokens(registrationTokens.filter(t => t.token_id !== tokenId));
      setMessage({ type: 'success', text: 'Token eliminado correctamente' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al eliminar token' });
    }
  };

  const revokeRegistrationToken = async (token) => {
    if (!confirm('¿Estás seguro de revocar este token?')) return;

    try {
      await api.post(`/registration-tokens/revoke/${token}`);
      setMessage({ type: 'success', text: 'Token revocado exitosamente' });
      loadRegistrationTokens();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al revocar token' });
    }
  };

  const getTokenStats = () => {
    const total = registrationTokens.length;
    const used = registrationTokens.filter(t => t.is_used).length;
    const expired = registrationTokens.filter(t => t.is_expired && !t.is_used).length;
    const available = registrationTokens.filter(t => !t.is_used && !t.is_expired).length;
    return { total, used, expired, available };
  };

  const setCurrentEvent = async (eventId) => {
    try {
      await api.post('/config', { key: 'current_event_id', value: eventId.toString() });
      setBettingConfig({ ...bettingConfig, current_event_id: eventId });
      setMessage({ type: 'success', text: 'Evento actual actualizado' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar evento' });
    }
  };

  const handleCreateFighter = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      await api.post('/maintainers/fighters', Object.fromEntries(formData));
      setMessage({ type: 'success', text: 'Peleador creado exitosamente' });
      e.target.reset();
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al crear peleador' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      await api.post('/maintainers/events', Object.fromEntries(formData));
      setMessage({ type: 'success', text: 'Evento creado exitosamente' });
      e.target.reset();
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al crear evento' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFight = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      data.is_title_fight = data.is_title_fight === 'true';
      data.is_main_event = data.is_main_event === 'true';
      data.is_co_main_event = data.is_co_main_event === 'true';
      await api.post('/maintainers/fights', data);
      setMessage({ type: 'success', text: 'Pelea creada exitosamente' });
      e.target.reset();
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al crear pelea' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFight = (fight) => {
    setEditingFight(fight);
    setShowEditModal(true);
  };

  const handleEditFighter = (fighter) => {
    setEditingFighter(fighter);
    setShowEditFighterModal(true);
  };

  const handleUpdateFighter = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      await api.put(`/maintainers/fighters/${editingFighter.fighter_id}`, Object.fromEntries(formData));
      setMessage({ type: 'success', text: 'Peleador actualizado exitosamente' });
      setShowEditFighterModal(false);
      setEditingFighter(null);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar peleador' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFight = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      data.is_title_fight = data.is_title_fight === 'true';
      data.is_main_event = data.is_main_event === 'true';
      data.is_co_main_event = data.is_co_main_event === 'true';
      await api.put(`/maintainers/fights/${editingFight.fight_id}`, data);
      setMessage({ type: 'success', text: 'Pelea actualizada exitosamente' });
      setShowEditModal(false);
      setEditingFight(null);
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al actualizar pelea' });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Acceso Denegado</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Control de Apuestas */}
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Control de Apuestas</h2>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>💡 Modo Replay - Para Testing y Nuevos Usuarios:</strong>
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Selecciona cualquier evento (incluso pasados) para habilitar apuestas</li>
              <li>• <strong>SOLO usuarios que NO han apostado</strong> podrán apostar en ese evento</li>
              <li>• Los usuarios que YA apostaron NO pueden volver a apostar (sus apuestas se mantienen)</li>
              <li>• Útil para testing y dar bonus inicial a nuevos usuarios</li>
              <li>• Para reiniciar, usa "Limpiar Apuestas" (borra resultados, NO apuestas)</li>
            </ul>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={toggleBetting}
              className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                bettingConfig.betting_enabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {bettingConfig.betting_enabled ? '✓ Apuestas Abiertas' : '✗ Apuestas Cerradas'}
            </button>

            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evento Actual para Apuestas
              </label>
              <select
                value={bettingConfig.current_event_id}
                onChange={(e) => setCurrentEvent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="0">Seleccionar evento...</option>
                {events.map((evt) => {
                  const eventDate = new Date(evt.event_date);
                  const isPast = eventDate < new Date();
                  return (
                    <option key={evt.event_id} value={evt.event_id}>
                      {evt.event_name} - {eventDate.toLocaleDateString('es-ES')}
                      {isPast ? ' (Pasado - Modo Replay)' : ' (Próximo)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Current Event Info */}
            {bettingConfig.current_event_id > 0 && (
              <div className="w-full mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm">
                  <strong>Evento Activo:</strong>{' '}
                  {events.find(e => e.event_id === parseInt(bettingConfig.current_event_id))?.event_name || 'N/A'}
                  {' - '}
                  <span className={bettingConfig.betting_enabled ? 'text-green-600 font-semibold' : 'text-red-600'}>
                    {bettingConfig.betting_enabled ? 'Abierto para apuestas' : 'Cerrado'}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {['fighters', 'events', 'fights', 'clear-bets', 'manage-users', 'registration-tokens'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                activeTab === tab ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600'
              }`}
            >
              {tab === 'fighters' && 'Peleadores'}
              {tab === 'events' && 'Eventos'}
              {tab === 'fights' && 'Peleas'}
              {tab === 'clear-bets' && 'Limpiar Apuestas'}
              {tab === 'manage-users' && 'Gestionar Usuarios'}
              {tab === 'registration-tokens' && 'Tokens de Registro'}
            </button>
          ))}
        </div>

        {/* Fighters Tab */}
        {activeTab === 'fighters' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Crear Peleador</h3>
              <form onSubmit={handleCreateFighter} className="space-y-3">
                <input name="fighter_name" placeholder="Nombre completo" required className="w-full px-4 py-2 border rounded-lg" />
                <input name="nickname" placeholder="Apodo (opcional)" className="w-full px-4 py-2 border rounded-lg" />
                <select name="country_id" required className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Seleccionar país</option>
                  {catalogs.countries?.map((c) => <option key={c.country_id} value={c.country_id}>{c.country_name}</option>)}
                </select>
                <select name="stance_id" className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Guardia (opcional)</option>
                  {catalogs.stances?.map((s) => <option key={s.stance_id} value={s.stance_id}>{s.stance_name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input name="height_cm" type="number" step="0.01" placeholder="Altura (cm)" className="px-4 py-2 border rounded-lg" />
                  <input name="reach_cm" type="number" step="0.01" placeholder="Alcance (cm)" className="px-4 py-2 border rounded-lg" />
                </div>
                <input name="date_of_birth" type="date" className="w-full px-4 py-2 border rounded-lg" />
                <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700">
                  {loading ? 'Creando...' : 'Crear Peleador'}
                </button>
              </form>
            </div>
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Peleadores ({fighters.length})</h3>

              {/* Search input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre o apodo..."
                  value={fighterSearch}
                  onChange={(e) => setFighterSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              {fighterSearch && (
                <p className="text-xs text-gray-500 mb-2">
                  {fighters.filter(f =>
                    f.fighter_name.toLowerCase().includes(fighterSearch.toLowerCase()) ||
                    (f.nickname || '').toLowerCase().includes(fighterSearch.toLowerCase())
                  ).length} resultado(s) · haz clic para editar
                </p>
              )}

              <div className="max-h-96 overflow-y-auto space-y-2">
                {!fighterSearch ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-sm">Escribe para buscar peleadores</p>
                  </div>
                ) : fighters.filter(f =>
                    f.fighter_name.toLowerCase().includes(fighterSearch.toLowerCase()) ||
                    (f.nickname || '').toLowerCase().includes(fighterSearch.toLowerCase())
                  ).length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-3xl mb-2">🥊</p>
                    <p className="text-sm">No se encontraron peleadores</p>
                  </div>
                ) : (
                  fighters
                    .filter(f =>
                      f.fighter_name.toLowerCase().includes(fighterSearch.toLowerCase()) ||
                      (f.nickname || '').toLowerCase().includes(fighterSearch.toLowerCase())
                    )
                    .map((f) => (
                      <div
                        key={f.fighter_id}
                        onClick={() => handleEditFighter(f)}
                        className="p-3 bg-gray-50 border border-transparent rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{f.fighter_name}</p>
                            {f.nickname && <p className="text-xs text-gray-500 italic">"{f.nickname}"</p>}
                            <p className="text-xs text-gray-500 mt-0.5">
                              {f.country_name || '—'}{f.stance_name ? ` · ${f.stance_name}` : ''}
                              {f.height_cm ? ` · ${f.height_cm} cm` : ''}
                            </p>
                          </div>
                          <span className="text-purple-500 text-xs font-semibold shrink-0 ml-2">Editar →</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Crear Evento</h3>
              <form onSubmit={handleCreateEvent} className="space-y-3">
                <input name="event_name" placeholder="Nombre del evento" required className="w-full px-4 py-2 border rounded-lg" />
                <input name="event_date" type="date" required className="w-full px-4 py-2 border rounded-lg" />
                <select name="event_type_id" required className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Tipo de evento</option>
                  {catalogs.event_types?.map((et) => <option key={et.event_type_id} value={et.event_type_id}>{et.event_type_name}</option>)}
                </select>
                <input name="venue" placeholder="Venue" className="w-full px-4 py-2 border rounded-lg" />
                <input name="city" placeholder="Ciudad" className="w-full px-4 py-2 border rounded-lg" />
                <input name="state" placeholder="Estado/Provincia" className="w-full px-4 py-2 border rounded-lg" />
                <select name="country_id" className="w-full px-4 py-2 border rounded-lg">
                  <option value="">País (opcional)</option>
                  {catalogs.countries?.map((c) => <option key={c.country_id} value={c.country_id}>{c.country_name}</option>)}
                </select>
                <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700">
                  {loading ? 'Creando...' : 'Crear Evento'}
                </button>
              </form>
            </div>
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Eventos ({events.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {events.map((e) => (
                  <div key={e.event_id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{e.event_name}</p>
                        <p className="text-sm text-gray-600">{new Date(e.event_date).toLocaleDateString()} | {e.event_type_name}</p>
                      </div>
                      <button
                        onClick={() => handleViewEventDetails(e.event_id)}
                        className="ml-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-semibold transition-colors"
                      >
                        Ver Detalles →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fights Tab */}
        {activeTab === 'fights' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Crear Pelea</h3>
              <form onSubmit={handleCreateFight} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <select name="event_id" required className="px-4 py-2 border rounded-lg">
                    <option value="">Seleccionar evento</option>
                    {events.map((e) => <option key={e.event_id} value={e.event_id}>{e.event_name}</option>)}
                  </select>
                  <select name="weight_class_id" required className="px-4 py-2 border rounded-lg">
                    <option value="">Categoría de peso</option>
                    {catalogs.weight_classes?.map((wc) => <option key={wc.weight_class_id} value={wc.weight_class_id}>{wc.class_name} ({wc.gender_name})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select name="fighter_red_id" required className="px-4 py-2 border rounded-lg">
                    <option value="">Peleador Rojo</option>
                    {fighters.map((f) => <option key={f.fighter_id} value={f.fighter_id}>{f.fighter_name}</option>)}
                  </select>
                  <input name="red_odds" type="number" step="0.01" placeholder="Cuota Rojo (ej: 1.53)" className="px-4 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select name="fighter_blue_id" required className="px-4 py-2 border rounded-lg">
                    <option value="">Peleador Azul</option>
                    {fighters.map((f) => <option key={f.fighter_id} value={f.fighter_id}>{f.fighter_name}</option>)}
                  </select>
                  <input name="blue_odds" type="number" step="0.01" placeholder="Cuota Azul (ej: 2.08)" className="px-4 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <select name="scheduled_rounds" required className="px-4 py-2 border rounded-lg">
                    <option value="3">3 Rounds</option>
                    <option value="5">5 Rounds</option>
                  </select>
                  <select name="fight_category_id" className="px-4 py-2 border rounded-lg">
                    <option value="">Seleccionar categoría</option>
                    {catalogs.fight_categories?.map((fc) => (
                      <option key={fc.category_id} value={fc.category_id}>
                        {fc.category_name}
                      </option>
                    ))}
                  </select>
                  <input name="display_order" type="number" placeholder="Orden (0)" defaultValue="0" className="px-4 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select name="is_title_fight" className="px-4 py-2 border rounded-lg">
                    <option value="false">No es título</option>
                    <option value="true">Pelea de título</option>
                  </select>
                  <select name="is_main_event" className="px-4 py-2 border rounded-lg">
                    <option value="false">No es main event</option>
                    <option value="true">Main Event</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700">
                  {loading ? 'Creando...' : 'Crear Pelea'}
                </button>
              </form>
            </div>
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">
                Peleas
                {selectedEventFilter ?
                  ` (${fights.filter(f => f.event_id === parseInt(selectedEventFilter)).length})` :
                  ` (${fights.length} total)`
                }
              </h3>

              {/* Event Filter */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Filtrar por Evento
                </label>
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">📋 Todos los eventos</option>
                  {events.map((evt) => (
                    <option key={evt.event_id} value={evt.event_id}>
                      {evt.event_name} - {new Date(evt.event_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {(selectedEventFilter
                  ? fights.filter(f => f.event_id === parseInt(selectedEventFilter))
                  : fights
                ).map((f) => (
                  <div
                    key={f.fight_id}
                    onClick={() => handleEditFight(f)}
                    className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-bold text-purple-600">{f.event_name}</p>
                    <p className="font-semibold mt-2">{f.red_fighter_name} vs {f.blue_fighter_name}</p>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span>🔴 {f.red_odds || 'N/A'}</span>
                      <span>🔵 {f.blue_odds || 'N/A'}</span>
                      <span>{f.weight_class_name}</span>
                      {f.is_title_fight && <span>🏆 Título</span>}
                      {f.category_name && <span>📂 {f.category_name}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click para editar</p>
                  </div>
                ))}
                {selectedEventFilter && fights.filter(f => f.event_id === parseInt(selectedEventFilter)).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">🥊</p>
                    <p>No hay peleas para este evento</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clear Bets Tab */}
        {activeTab === 'clear-bets' && (
          <div className="space-y-6">
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">🗑️ Limpiar Apuestas de Usuario</h3>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona un usuario y un evento para eliminar todas sus apuestas de ese evento específico.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Usuario
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Seleccionar usuario...</option>
                    <option value="all">🌐 TODOS LOS USUARIOS</option>
                    {users.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.nickname || u.username} (@{u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Evento
                  </label>
                  <select
                    value={selectedUserEvent}
                    onChange={(e) => setSelectedUserEvent(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Seleccionar evento...</option>
                    {events.map((evt) => (
                      <option key={evt.event_id} value={evt.event_id}>
                        {evt.event_name} - {new Date(evt.event_date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading && (
                <div className="text-center py-4 text-gray-600">
                  Cargando apuestas...
                </div>
              )}

              {selectedUser === 'all' && selectedUserEvent && (
                <div className="mt-6">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          <strong>¡Advertencia!</strong> Estás a punto de eliminar <strong>TODAS las apuestas de TODOS los usuarios</strong> para este evento.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg"
                  >
                    🗑️ Limpiar TODAS las Apuestas del Evento
                  </button>
                </div>
              )}

              {!loading && selectedUser && selectedUser !== 'all' && selectedUserEvent && userBets.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">
                      Apuestas encontradas: {userBets.length}
                    </h4>
                    <button
                      onClick={() => setShowConfirmClear(true)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                    >
                      Limpiar Todas las Apuestas
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {userBets.map((bet) => (
                      <div key={bet.bet_id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-sm">
                              {bet.red_fighter_name} vs {bet.blue_fighter_name}
                            </p>
                            <p className="text-xs text-gray-600">{bet.weight_class_name}</p>
                            <p className="text-xs text-purple-600 font-semibold mt-1">
                              Predicción: {bet.predicted_winner_name || bet.bet_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{bet.bet_amount} pts</p>
                            <p className="text-xs text-green-600">→ {bet.potential_return} pts</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              bet.status === 'won' ? 'bg-green-100 text-green-700' :
                              bet.status === 'lost' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {bet.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && selectedUser && selectedUser !== 'all' && selectedUserEvent && userBets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📭</p>
                  <p>No hay apuestas para este usuario en este evento</p>
                </div>
              )}

              {!selectedUser && !selectedUserEvent && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-4xl mb-2">👆</p>
                  <p>Selecciona un usuario y un evento para comenzar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'manage-users' && (
          <div className="space-y-6">
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">👥 Gestionar Usuarios</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lista de todos los usuarios registrados. Puedes eliminar usuarios individuales (excepto admin).
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Información:</strong> Al eliminar un usuario se eliminarán también todas sus apuestas asociadas.
                    </p>
                  </div>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">👤</p>
                  <p>No hay usuarios registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.user_id} className={`rounded-lg p-4 flex items-center justify-between transition-colors ${user.is_active ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-100 opacity-60'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.is_active ? 'bg-purple-600' : 'bg-gray-400'}`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                              {user.nickname || user.username}
                              {!user.is_active && (
                                <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                                  deshabilitado
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Puntos totales</p>
                          <p className="font-semibold text-purple-600">{user.total_points || 0} pts</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Puede apostar</p>
                          <p className={`font-semibold ${user.can_bet ? 'text-green-600' : 'text-red-600'}`}>
                            {user.can_bet ? 'Sí' : 'No'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Registro</p>
                          <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                            {new Date(user.created_at).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {user.role !== 'admin' && (
                          <div className="flex flex-col gap-1">
                            {/* Botón deshabilitar/habilitar cuenta */}
                            <button
                              onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}
                              disabled={loading}
                              className={`px-3 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors ${
                                user.is_active
                                  ? 'bg-gray-500 hover:bg-gray-600'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {user.is_active ? 'Deshabilitar' : 'Habilitar'}
                            </button>
                            {/* Botón eliminar con confirmación */}
                            {confirmingDeleteUser === user.user_id ? (
                              <>
                                <button
                                  onClick={() => handleDeleteUser(user.user_id, user.username)}
                                  disabled={loading}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                                >
                                  ✓ Confirmar
                                </button>
                                <button
                                  onClick={() => setConfirmingDeleteUser(null)}
                                  className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-semibold"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(user.user_id, user.username)}
                                disabled={loading}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                              >
                                🗑️ Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Total de usuarios:</strong> {users.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Tokens Tab */}
        {activeTab === 'registration-tokens' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-gray-800">{getTokenStats().total}</div>
                <div className="text-gray-600 text-sm">Total Tokens</div>
              </div>
              <div className="bg-green-50 rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-green-600">{getTokenStats().available}</div>
                <div className="text-gray-600 text-sm">Disponibles</div>
              </div>
              <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600">{getTokenStats().used}</div>
                <div className="text-gray-600 text-sm">Usados</div>
              </div>
              <div className="bg-red-50 rounded-xl shadow-lg p-6">
                <div className="text-3xl font-bold text-red-600">{getTokenStats().expired}</div>
                <div className="text-gray-600 text-sm">Expirados</div>
              </div>
            </div>

            {/* Create Token */}
            <div className="bg-white/95 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">🔑 Crear Nuevo Token de Registro</h3>
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
                  onClick={createRegistrationToken}
                  disabled={creatingToken}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  {creatingToken ? 'Creando...' : 'Generar Token'}
                </button>
              </div>
            </div>

            {/* Tokens List */}
            <div className="bg-white/95 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
                <h3 className="text-2xl font-bold text-white">Tokens de Registro</h3>
              </div>

              {registrationTokens.length === 0 ? (
                <div className="p-8 text-center text-gray-600">No hay tokens creados</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL de Registro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado Por</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usado Por</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrationTokens.map((token) => {
                        const tokenUrl = `${window.location.origin}/?token=${token.token}`;
                        return (
                          <tr key={token.token_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={tokenUrl}
                                  readOnly
                                  className="flex-1 px-3 py-1 bg-gray-50 border border-gray-300 rounded text-xs font-mono"
                                />
                              </div>
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
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-3">
                                {token.status === 'disponible' && (
                                  <>
                                    <button
                                      onClick={() => copyTokenUrl(token.token)}
                                      className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      📋 Copiar
                                    </button>
                                    <button
                                      onClick={() => revokeRegistrationToken(token.token)}
                                      className="text-orange-600 hover:text-orange-800 font-medium"
                                    >
                                      Revocar
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => deleteRegistrationToken(token.token_id)}
                                  title="Eliminar token"
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmClear && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  ¿Confirmar Eliminación?
                </h2>
                <p className="text-gray-600">
                  {selectedUser === 'all' ? (
                    <>
                      Estás a punto de eliminar <strong>TODAS las apuestas de TODOS los usuarios</strong> para el evento seleccionado.
                    </>
                  ) : (
                    <>
                      Estás a punto de eliminar <strong>{userBets.length} apuesta{userBets.length !== 1 ? 's' : ''}</strong>.
                    </>
                  )}
                </p>
                <p className="text-red-600 font-semibold mt-3">
                  Esta acción no se puede deshacer
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleClearUserBets}
                  className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                >
                  Sí, Eliminar Apuestas
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Fight Modal */}
        {showEditModal && editingFight && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">✏️ Editar Pelea</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFight(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateFight} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Evento</label>
                    <select
                      name="event_id"
                      defaultValue={editingFight.event_id}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {events.map((e) => (
                        <option key={e.event_id} value={e.event_id}>{e.event_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría de Peso</label>
                    <select
                      name="weight_class_id"
                      defaultValue={editingFight.weight_class_id}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {catalogs.weight_classes?.map((wc) => (
                        <option key={wc.weight_class_id} value={wc.weight_class_id}>
                          {wc.class_name} ({wc.gender_name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peleador Rojo</label>
                    <select
                      name="fighter_red_id"
                      defaultValue={editingFight.fighter_red_id}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {fighters.map((f) => (
                        <option key={f.fighter_id} value={f.fighter_id}>{f.fighter_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuota Rojo</label>
                    <input
                      name="red_odds"
                      type="number"
                      step="0.01"
                      defaultValue={editingFight.red_odds}
                      placeholder="Ej: 1.53"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peleador Azul</label>
                    <select
                      name="fighter_blue_id"
                      defaultValue={editingFight.fighter_blue_id}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {fighters.map((f) => (
                        <option key={f.fighter_id} value={f.fighter_id}>{f.fighter_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cuota Azul</label>
                    <input
                      name="blue_odds"
                      type="number"
                      step="0.01"
                      defaultValue={editingFight.blue_odds}
                      placeholder="Ej: 2.08"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rounds</label>
                    <select
                      name="scheduled_rounds"
                      defaultValue={editingFight.scheduled_rounds}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="3">3 Rounds</option>
                      <option value="5">5 Rounds</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      name="fight_category_id"
                      defaultValue={editingFight.fight_category_id || ''}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Seleccionar</option>
                      {catalogs.fight_categories?.map((fc) => (
                        <option key={fc.category_id} value={fc.category_id}>
                          {fc.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                    <input
                      name="display_order"
                      type="number"
                      defaultValue={editingFight.display_order || 0}
                      placeholder="0"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Pelea de Título?</label>
                    <select
                      name="is_title_fight"
                      defaultValue={editingFight.is_title_fight ? 'true' : 'false'}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Main Event?</label>
                    <select
                      name="is_main_event"
                      defaultValue={editingFight.is_main_event ? 'true' : 'false'}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Pelea'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingFight(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Fighter Modal */}
        {showEditFighterModal && editingFighter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">✏️ Editar Peleador</h2>
                <button
                  onClick={() => { setShowEditFighterModal(false); setEditingFighter(null); }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >×</button>
              </div>

              <form onSubmit={handleUpdateFighter} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    name="fighter_name"
                    defaultValue={editingFighter.fighter_name}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apodo</label>
                  <input
                    name="nickname"
                    defaultValue={editingFighter.nickname || ''}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                    <select
                      name="country_id"
                      defaultValue={editingFighter.country_id || ''}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Seleccionar país</option>
                      {catalogs.countries?.map((c) => (
                        <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guardia</label>
                    <select
                      name="stance_id"
                      defaultValue={editingFighter.stance_id || ''}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Sin especificar</option>
                      {catalogs.stances?.map((s) => (
                        <option key={s.stance_id} value={s.stance_id}>{s.stance_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                    <input
                      name="height_cm"
                      type="number"
                      step="0.01"
                      defaultValue={editingFighter.height_cm || ''}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alcance (cm)</label>
                    <input
                      name="reach_cm"
                      type="number"
                      step="0.01"
                      defaultValue={editingFighter.reach_cm || ''}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                  <input
                    name="date_of_birth"
                    type="date"
                    defaultValue={editingFighter.date_of_birth ? editingFighter.date_of_birth.substring(0, 10) : ''}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Peleador'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEditFighterModal(false); setEditingFighter(null); }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventDetailsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">📋 Detalles del Evento</h2>
                <button
                  onClick={closeEventDetailsModal}
                  className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {loadingEventDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-600 text-xl">Cargando detalles del evento...</div>
                  </div>
                ) : selectedEventDetails ? (
                  <>
                    {/* Event Header */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedEventDetails.event_name}</h1>
                          <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                            <span className="flex items-center gap-2">
                              📅 {new Date(selectedEventDetails.event_date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-2">
                              🏟️ {selectedEventDetails.venue || 'Venue no especificado'}
                            </span>
                            {selectedEventDetails.city && (
                              <span className="flex items-center gap-2">
                                📍 {selectedEventDetails.city}{selectedEventDetails.state && `, ${selectedEventDetails.state}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className={`px-4 py-2 rounded-lg font-semibold text-sm text-center ${
                            selectedEventDetails.betting_enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {selectedEventDetails.betting_enabled ? '🎲 Apuestas Abiertas' : '🔒 Apuestas Cerradas'}
                          </span>
                          <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold text-sm text-center">
                            {selectedEventDetails.event_type_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fights List */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Peleas del Evento ({eventDetailsFights.length})
                    </h3>

                    {eventDetailsFights.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">🥊</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No hay peleas registradas</h2>
                        <p className="text-gray-600">Este evento aún no tiene peleas configuradas.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {eventDetailsFights.map((fight, index) => (
                          <div key={fight.fight_id} className="bg-gray-50 rounded-xl overflow-hidden">
                            <div className="p-6">
                              {/* Fight Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl font-bold text-gray-400">#{index + 1}</span>
                                  <div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                      {fight.weight_class_name}
                                    </span>
                                    {fight.is_title_fight && (
                                      <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                        🏆 Título
                                      </span>
                                    )}
                                    {fight.is_main_event && (
                                      <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                        ⭐ Main Event
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-gray-500 font-semibold text-sm">
                                  {fight.scheduled_rounds} Rounds
                                </div>
                              </div>

                              {/* Fighters Display */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                {/* Red Fighter */}
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">🔴</span>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-gray-800">{fight.red_fighter_name}</h3>
                                      {fight.red_fighter_nickname && (
                                        <p className="text-xs text-gray-600 italic">"{fight.red_fighter_nickname}"</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    {fight.red_fighter_record && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Record:</span>
                                        <span className="font-semibold text-gray-800">{fight.red_fighter_record}</span>
                                      </div>
                                    )}
                                    {fight.red_odds && (
                                      <div className="mt-2 pt-2 border-t border-red-200">
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600">Cuota:</span>
                                          <span className="text-xl font-bold text-red-600">{fight.red_odds}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* VS Divider */}
                                <div className="text-center">
                                  <div className="text-4xl font-bold text-gray-300">VS</div>
                                  {(fight.draw_odds || fight.no_contest_odds) && (
                                    <div className="mt-2 space-y-2">
                                      {fight.draw_odds && (
                                        <div className="bg-gray-100 rounded-lg p-2">
                                          <p className="text-xs text-gray-600">Empate</p>
                                          <p className="text-lg font-bold text-gray-700">{fight.draw_odds}</p>
                                        </div>
                                      )}
                                      {fight.no_contest_odds && (
                                        <div className="bg-orange-100 rounded-lg p-2">
                                          <p className="text-xs text-gray-600">No Contest</p>
                                          <p className="text-lg font-bold text-orange-700">{fight.no_contest_odds}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Blue Fighter */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">🔵</span>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-bold text-gray-800">{fight.blue_fighter_name}</h3>
                                      {fight.blue_fighter_nickname && (
                                        <p className="text-xs text-gray-600 italic">"{fight.blue_fighter_nickname}"</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    {fight.blue_fighter_record && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Record:</span>
                                        <span className="font-semibold text-gray-800">{fight.blue_fighter_record}</span>
                                      </div>
                                    )}
                                    {fight.blue_odds && (
                                      <div className="mt-2 pt-2 border-t border-blue-200">
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600">Cuota:</span>
                                          <span className="text-xl font-bold text-blue-600">{fight.blue_odds}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Fight Result */}
                              {fight.winner_id && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="bg-green-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-green-800 font-semibold">
                                        ✓ Ganador: {fight.winner_name}
                                      </span>
                                      {fight.result_type_code && (
                                        <span className="text-green-700">
                                          {fight.result_type_code === 'fighter_win' ? 'Victoria' :
                                           fight.result_type_code === 'draw' ? 'Empate' :
                                           fight.result_type_code === 'no_contest' ? 'No Contest' :
                                           fight.result_type_code}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintainers;
