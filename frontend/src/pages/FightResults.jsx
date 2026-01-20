import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const FightResults = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadEvents();
  }, [user]);

  useEffect(() => {
    const eventId = searchParams.get('event_id');
    if (eventId) {
      setSelectedEvent(eventId);
      loadFights(eventId);
    }
  }, [searchParams]);

  const loadEvents = async () => {
    try {
      const res = await api.get('/bets/events');
      setEvents(res.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
      setMessage({ type: 'error', text: 'Error al cargar eventos' });
    } finally {
      setLoading(false);
    }
  };

  const loadFights = async (eventId) => {
    try {
      setLoading(true);
      const res = await api.get(`/results/event/${eventId}`);
      setFights(res.data.data);
    } catch (error) {
      console.error('Error loading fights:', error);
      setMessage({ type: 'error', text: 'Error al cargar peleas' });
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    navigate(`/fight-results?event_id=${eventId}`);
  };

  const handleResultSubmit = async (fightId, result_type, winner_id) => {
    try {
      await api.post(`/results/fight/${fightId}`, {
        result_type,
        winner_id
      });

      setMessage({ type: 'success', text: 'Resultado guardado exitosamente' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

      // Reload fights
      loadFights(selectedEvent);
    } catch (error) {
      console.error('Error saving result:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar resultado'
      });
    }
  };

  if (loading && !selectedEvent) {
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
            <span className="text-2xl font-bold text-white">🏆 Ingreso de Resultados</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/events')} className="text-white hover:text-white/80 font-medium">Eventos</button>
              <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
              <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        )}

        {/* Event Selector */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Seleccionar Evento
          </label>
          <select
            value={selectedEvent || ''}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Seleccione un evento...</option>
            {events.map((event) => (
              <option key={event.event_id} value={event.event_id}>
                {event.event_name} - {new Date(event.event_date).toLocaleDateString('es-ES')}
              </option>
            ))}
          </select>
        </div>

        {/* Fights List */}
        {selectedEvent && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-white text-center py-8">Cargando peleas...</div>
            ) : fights.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
                <p className="text-gray-600">No hay peleas para este evento</p>
              </div>
            ) : (
              fights.map((fight) => (
                <div key={fight.fight_id} className="bg-white rounded-xl shadow-lg p-6">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">
                      {fight.category_code === 'title_fight' ? '🏆' :
                       fight.category_code === 'main_card' ? '⭐' : '🥊'}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">{fight.category_name}</span>
                    {fight.is_title_fight && (
                      <span className="ml-2 px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        TITLE FIGHT
                      </span>
                    )}
                  </div>

                  {/* Fight Info */}
                  <h4 className="text-lg font-bold text-gray-800 mb-4">{fight.weight_class_name}</h4>

                  {/* Fighters */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-center flex-1">
                      <div className="text-red-600 font-bold text-lg">🔴 {fight.red_fighter_name}</div>
                    </div>
                    <div className="text-center px-4">
                      <span className="text-gray-500 font-bold text-xl">VS</span>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-blue-600 font-bold text-lg">🔵 {fight.blue_fighter_name}</div>
                    </div>
                  </div>

                  {/* Current Result Status */}
                  {fight.result_type && fight.result_type !== 'pending' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-green-800">
                        ✓ Resultado registrado: {
                          fight.result_type === 'draw' ? 'Empate' :
                          fight.result_type === 'no_contest' ? 'No Contest' :
                          fight.winner_name
                        }
                      </p>
                    </div>
                  )}

                  {/* Result Buttons */}
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => handleResultSubmit(fight.fight_id, 'fighter_win', fight.red_fighter_id)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                        fight.result_type === 'fighter_win' && fight.winner_id === fight.red_fighter_id
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      Ganó Rojo
                    </button>
                    <button
                      onClick={() => handleResultSubmit(fight.fight_id, 'draw', null)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                        fight.result_type === 'draw'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Empate
                    </button>
                    <button
                      onClick={() => handleResultSubmit(fight.fight_id, 'no_contest', null)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                        fight.result_type === 'no_contest'
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      }`}
                    >
                      No Contest
                    </button>
                    <button
                      onClick={() => handleResultSubmit(fight.fight_id, 'fighter_win', fight.blue_fighter_id)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                        fight.result_type === 'fighter_win' && fight.winner_id === fight.blue_fighter_id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      Ganó Azul
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FightResults;
