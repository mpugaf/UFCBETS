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

  const [bettingConfig, setBettingConfig] = useState({ betting_enabled: false, current_event_id: 0 });

  useEffect(() => {
    loadCatalogs();
    loadData();
    loadConfig();
  }, []);

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
          {['fighters', 'events', 'fights'].map((tab) => (
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
                  <div key={e.event_id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold">{e.event_name}</p>
                    <p className="text-sm text-gray-600">{new Date(e.event_date).toLocaleDateString()} | {e.event_type_name}</p>
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
              <h3 className="text-xl font-bold mb-4">Peleas ({fights.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {fights.map((f) => (
                  <div key={f.fight_id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-bold text-purple-600">{f.event_name}</p>
                    <p className="font-semibold mt-2">{f.red_fighter_name} vs {f.blue_fighter_name}</p>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span>🔴 {f.red_odds || 'N/A'}</span>
                      <span>🔵 {f.blue_odds || 'N/A'}</span>
                      <span>{f.weight_class_name}</span>
                      {f.is_title_fight && <span>🏆 Título</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maintainers;
