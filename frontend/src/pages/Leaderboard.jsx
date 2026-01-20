import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Leaderboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('event'); // 'event' or 'yearly'
  const [events, setEvents] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (viewMode === 'event' && selectedEvent) {
      loadEventLeaderboard(selectedEvent);
    } else if (viewMode === 'yearly' && selectedYear) {
      loadYearlyLeaderboard(selectedYear);
    }
  }, [viewMode, selectedEvent, selectedYear]);

  const loadInitialData = async () => {
    try {
      // Load closed events
      const eventsRes = await api.get('/bets/events');
      const closedEvents = eventsRes.data.data.filter(e => !e.betting_enabled);
      setEvents(closedEvents);

      if (closedEvents.length > 0) {
        setSelectedEvent(closedEvents[0].event_id);
      }

      // Load available years
      const yearsRes = await api.get('/leaderboard/years');
      setYears(yearsRes.data.data);

      setLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setMessage({ type: 'error', text: 'Error al cargar datos' });
      setLoading(false);
    }
  };

  const loadEventLeaderboard = async (eventId) => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard/event/${eventId}`);
      setLeaderboard(res.data.data);
    } catch (error) {
      console.error('Error loading event leaderboard:', error);
      if (error.response?.status === 403) {
        setMessage({ type: 'error', text: 'Las apuestas deben estar cerradas para ver la clasificación' });
      } else {
        setMessage({ type: 'error', text: 'Error al cargar clasificación' });
      }
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyLeaderboard = async (year) => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard/year/${year}`);
      setLeaderboard(res.data.data);
    } catch (error) {
      console.error('Error loading yearly leaderboard:', error);
      setMessage({ type: 'error', text: 'Error al cargar clasificación anual' });
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}°`;
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.event_id === parseInt(eventId));
    return event ? event.event_name : '';
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando clasificación...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">🏆 Tabla de Clasificación</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/events')} className="text-white hover:text-white/80 font-medium">Eventos</button>
              <button onClick={() => navigate('/my-bets')} className="text-white hover:text-white/80 font-medium">Mis Apuestas</button>
              {user?.role === 'admin' && (
                <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
              )}
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

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('event')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'event'
                ? 'bg-white text-purple-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📅 Por Evento
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'yearly'
                ? 'bg-white text-purple-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📆 Clasificación Anual
          </button>
        </div>

        {/* Event/Year Selector */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          {viewMode === 'event' ? (
            <>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Seleccionar Evento
              </label>
              <select
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Seleccione un evento...</option>
                {events.map((event) => (
                  <option key={event.event_id} value={event.event_id}>
                    {event.event_name} - {new Date(event.event_date).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Seleccionar Año
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* Leaderboard Header */}
        {leaderboard.length > 0 && (
          <div className="bg-white rounded-t-2xl shadow-2xl p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {viewMode === 'event'
                ? `🏆 ${getEventName(selectedEvent)}`
                : `🏆 Clasificación ${selectedYear}`}
            </h2>
            <p className="text-gray-600">
              {viewMode === 'event'
                ? `${leaderboard.length} participantes`
                : `${leaderboard.length} participantes en ${leaderboard[0]?.events_participated || 0} eventos`}
            </p>
          </div>
        )}

        {/* Leaderboard Table */}
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sin Datos</h2>
            <p className="text-gray-600">
              {viewMode === 'event'
                ? 'No hay clasificación disponible para este evento. Asegúrate de que las apuestas estén cerradas y que haya resultados ingresados.'
                : 'No hay clasificación disponible para este año.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Posición</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Usuario</th>
                    {viewMode === 'yearly' && (
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Eventos</th>
                    )}
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Apuestas</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Aciertos</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Precisión</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Puntos Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.user_id === user?.user_id;
                    return (
                      <tr
                        key={entry.user_id}
                        className={`${
                          isCurrentUser ? 'bg-purple-50' : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-2xl font-bold">
                            {getMedalEmoji(index)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                              {(entry.nickname || entry.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-800">
                                {entry.nickname || entry.username}
                                {isCurrentUser && <span className="ml-2 text-purple-600">(Tú)</span>}
                              </div>
                              {entry.nickname && (
                                <div className="text-xs text-gray-500">@{entry.username}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        {viewMode === 'yearly' && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-semibold text-gray-700">{entry.events_participated}</span>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-700">{entry.total_bets}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {entry.correct_bets}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-gray-700">
                            {entry.accuracy_percentage || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-lg font-bold ${
                            parseFloat(entry.total_points || 0) > 0
                              ? 'text-green-600'
                              : parseFloat(entry.total_points || 0) < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {parseFloat(entry.total_points || 0).toFixed(2)} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
