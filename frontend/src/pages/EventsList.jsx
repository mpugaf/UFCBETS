import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EventsList = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get('/bets/events');
      setEvents(res.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return event.event_status === 'upcoming' || event.event_status === 'today';
    if (filter === 'past') return event.event_status === 'past';
    return true;
  });

  const upcomingEvents = events.filter(e => e.event_status === 'upcoming' || e.event_status === 'today');
  const pastEvents = events.filter(e => e.event_status === 'past');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleEventClick = (event) => {
    // Always navigate to betting page with event_id to show fights
    navigate(`/betting?event_id=${event.event_id}`);
  };

  const handleViewPredictions = (event, e) => {
    e.stopPropagation();
    navigate(`/public-predictions?event_id=${event.event_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">UFC Eventos</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/betting')} className="text-white hover:text-white/80 font-medium">Apostar</button>
              <button onClick={() => navigate('/my-bets')} className="text-white hover:text-white/80 font-medium">Mis Apuestas</button>
              <button onClick={() => navigate('/leaderboard')} className="text-white hover:text-white/80 font-medium">Clasificación</button>
              {user?.role === 'admin' && (
                <>
                  <button onClick={() => navigate('/fight-results')} className="text-white hover:text-white/80 font-medium">Resultados</button>
                  <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
                </>
              )}
              <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Eventos UFC</h1>
          <p className="text-white/80">Explora eventos disponibles para apostar o revisa tus apuestas anteriores</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-white text-purple-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Todos ({events.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'upcoming'
                ? 'bg-white text-purple-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Próximos ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'past'
                ? 'bg-white text-purple-900'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Pasados ({pastEvents.length})
          </button>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-white text-xl">No hay eventos disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.event_id}
                onClick={() => handleEventClick(event)}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 cursor-pointer transition-all transform hover:scale-105"
              >
                {/* Event Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.event_status === 'upcoming'
                        ? 'bg-green-500 text-white'
                        : event.event_status === 'today'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {event.event_status === 'upcoming'
                      ? 'Próximo'
                      : event.event_status === 'today'
                      ? 'Hoy'
                      : 'Finalizado'}
                  </span>
                </div>

                {/* Event Name */}
                <h3 className="text-xl font-bold text-white mb-2">{event.event_name}</h3>

                {/* Event Date */}
                <p className="text-white/80 text-sm mb-1">
                  📅 {formatDate(event.event_date)}
                </p>

                {/* Event Location */}
                {event.venue && (
                  <p className="text-white/60 text-sm mb-4">
                    📍 {event.venue}, {event.city}
                  </p>
                )}

                {/* Event Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{event.total_fights}</p>
                    <p className="text-xs text-white/60">Peleas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{event.pending_fights}</p>
                    <p className="text-xs text-white/60">Pendientes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{event.user_bets}</p>
                    <p className="text-xs text-white/60">Tus Apuestas</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {event.event_status === 'upcoming' || event.event_status === 'today' ? (
                    <p className="text-green-400 text-sm font-semibold text-center">
                      Haz clic para apostar →
                    </p>
                  ) : (
                    <p className="text-blue-400 text-sm font-semibold text-center">
                      Ver mis apuestas →
                    </p>
                  )}

                  <button
                    onClick={(e) => handleViewPredictions(event, e)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                  >
                    👁️ Ver Pronósticos de Todos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
