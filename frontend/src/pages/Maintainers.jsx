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

  useEffect(() => {
    loadCatalogs();
    loadData();
    loadConfig();
    loadUsers();
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
      data.is_co_main_event = data.is_co_main_event === 'false';
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

  const handleUpdateFight = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      data.is_title_fight = data.is_title_fight === 'true';
      data.is_main_event = data.is_main_event === 'true';
      data.is_co_main_event = data.is_co_main_event === 'false';
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
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">⚙️ Mantenedores</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/manage-tokens')} className="text-white hover:text-white/80 font-medium">Tokens</button>
              <button onClick={() => navigate('/fighter-images')} className="text-white hover:text-white/80 font-medium">Imágenes</button>
              <button onClick={() => navigate('/users-management')} className="text-white hover:text-white/80 font-medium">Usuarios</button>
              <button onClick={() => navigate('/clear-bets')} className="text-white hover:text-white/80 font-medium">Limpiar Resultados</button>
              <button onClick={() => navigate('/admin')} className="text-white hover:text-white/80 font-medium">Panel Admin</button>
              <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Control de Apuestas */}
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Control de Apuestas</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleBetting}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                bettingConfig.betting_enabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {bettingConfig.betting_enabled ? '✓ Apuestas Abiertas' : '✗ Apuestas Cerradas'}
            </button>
            <select
              value={bettingConfig.current_event_id}
              onChange={(e) => setCurrentEvent(e.target.value)}
              className="px-4 py-3 border rounded-lg"
            >
              <option value="0">Seleccionar evento actual</option>
              {events.map((evt) => (
                <option key={evt.event_id} value={evt.event_id}>
                  {evt.event_name} - {new Date(evt.event_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {['fighters', 'events', 'fights', 'clear-bets', 'manage-users'].map((tab) => (
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
              <div className="max-h-96 overflow-y-auto space-y-2">
                {fighters.map((f) => (
                  <div key={f.fighter_id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold">{f.fighter_name}</p>
                    <p className="text-sm text-gray-600">{f.country_name} | {f.stance_name}</p>
                  </div>
                ))}
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
                        onClick={() => navigate(`/event-details/${e.event_id}`)}
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
                    <div key={user.user_id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.nickname || user.username}
                              {user.role === 'admin' && (
                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                  ADMIN
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
                        {user.role !== 'admin' && (
                          <div className="flex flex-col gap-1">
                            {confirmingDeleteUser === user.user_id ? (
                              <>
                                <button
                                  onClick={() => handleDeleteUser(user.user_id, user.username)}
                                  disabled={loading}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                                >
                                  ✓ Confirmar
                                </button>
                                <button
                                  onClick={() => setConfirmingDeleteUser(null)}
                                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-semibold"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(user.user_id, user.username)}
                                disabled={loading}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
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
      </div>
    </div>
  );
};

export default Maintainers;
