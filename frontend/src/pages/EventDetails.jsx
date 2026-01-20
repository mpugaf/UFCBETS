import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const EventDetails = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);

      // Get event details
      const eventRes = await api.get(`/maintainers/events/${eventId}`);
      setEvent(eventRes.data.data);

      // Get fights for this event
      const fightsRes = await api.get(`/maintainers/fights?event_id=${eventId}`);
      setFights(fightsRes.data.data);
    } catch (error) {
      console.error('Error loading event details:', error);
      setMessage({ type: 'error', text: 'Error al cargar detalles del evento' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando detalles del evento...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Evento no encontrado</h1>
          <button onClick={() => navigate('/maintainers')} className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold">
            Volver a Mantenedores
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
            <span className="text-2xl font-bold text-white">📋 Detalles del Evento</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
              {user?.role === 'admin' && (
                <button onClick={() => navigate('/fight-results?event_id=' + eventId)} className="text-white hover:text-white/80 font-medium">Resultados</button>
              )}
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

        {/* Event Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{event.event_name}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  📅 {new Date(event.event_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-2">
                  🏟️ {event.venue || 'Venue no especificado'}
                </span>
                {event.city && (
                  <span className="flex items-center gap-2">
                    📍 {event.city}{event.state && `, ${event.state}`}{event.country_name && `, ${event.country_name}`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className={`px-4 py-2 rounded-lg font-semibold text-center ${
                event.betting_enabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.betting_enabled ? '🎲 Apuestas Abiertas' : '🔒 Apuestas Cerradas'}
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold text-center">
                {event.event_type_name}
              </span>
            </div>
          </div>
        </div>

        {/* Fights List */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Peleas del Evento ({fights.length})
          </h2>
        </div>

        {fights.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🥊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No hay peleas registradas</h2>
            <p className="text-gray-600 mb-6">
              Este evento aún no tiene peleas configuradas.
            </p>
            <button
              onClick={() => navigate('/maintainers')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Ir a Mantenedores
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {fights.map((fight, index) => (
              <div key={fight.fight_id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                  {/* Fight Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {fight.weight_class_name}
                        </span>
                        {fight.is_title_fight && (
                          <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                            🏆 Pelea de Título
                          </span>
                        )}
                        {fight.is_main_event && (
                          <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                            ⭐ Main Event
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-500 font-semibold">
                      {fight.scheduled_rounds} Rounds
                    </div>
                  </div>

                  {/* Fighters Display */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Red Fighter */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">🔴</span>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{fight.red_fighter_name}</h3>
                          {fight.red_fighter_nickname && (
                            <p className="text-sm text-gray-600 italic">"{fight.red_fighter_nickname}"</p>
                          )}
                        </div>
                      </div>

                      {/* Red Fighter Stats */}
                      <div className="space-y-2 text-sm">
                        {fight.red_fighter_record && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Record:</span>
                            <span className="font-semibold text-gray-800">{fight.red_fighter_record}</span>
                          </div>
                        )}
                        {fight.red_fighter_height && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estatura:</span>
                            <span className="font-semibold text-gray-800">{fight.red_fighter_height} cm</span>
                          </div>
                        )}
                        {fight.red_fighter_reach && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Alcance:</span>
                            <span className="font-semibold text-gray-800">{fight.red_fighter_reach} cm</span>
                          </div>
                        )}
                        {fight.red_fighter_country && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">País:</span>
                            <span className="font-semibold text-gray-800">{fight.red_fighter_country}</span>
                          </div>
                        )}
                        {fight.red_fighter_stance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Guardia:</span>
                            <span className="font-semibold text-gray-800">{fight.red_fighter_stance}</span>
                          </div>
                        )}
                        {fight.red_odds && (
                          <div className="mt-4 pt-4 border-t border-red-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Cuota:</span>
                              <span className="text-2xl font-bold text-red-600">{fight.red_odds}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* VS Divider */}
                    <div className="text-center">
                      <div className="text-6xl font-bold text-gray-300">VS</div>
                      {(fight.draw_odds || fight.no_contest_odds) && (
                        <div className="mt-4 space-y-2">
                          {fight.draw_odds && (
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Empate</p>
                              <p className="text-xl font-bold text-gray-700">{fight.draw_odds}</p>
                            </div>
                          )}
                          {fight.no_contest_odds && (
                            <div className="bg-orange-100 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">No Contest</p>
                              <p className="text-xl font-bold text-orange-700">{fight.no_contest_odds}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Blue Fighter */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">🔵</span>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{fight.blue_fighter_name}</h3>
                          {fight.blue_fighter_nickname && (
                            <p className="text-sm text-gray-600 italic">"{fight.blue_fighter_nickname}"</p>
                          )}
                        </div>
                      </div>

                      {/* Blue Fighter Stats */}
                      <div className="space-y-2 text-sm">
                        {fight.blue_fighter_record && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Record:</span>
                            <span className="font-semibold text-gray-800">{fight.blue_fighter_record}</span>
                          </div>
                        )}
                        {fight.blue_fighter_height && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estatura:</span>
                            <span className="font-semibold text-gray-800">{fight.blue_fighter_height} cm</span>
                          </div>
                        )}
                        {fight.blue_fighter_reach && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Alcance:</span>
                            <span className="font-semibold text-gray-800">{fight.blue_fighter_reach} cm</span>
                          </div>
                        )}
                        {fight.blue_fighter_country && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">País:</span>
                            <span className="font-semibold text-gray-800">{fight.blue_fighter_country}</span>
                          </div>
                        )}
                        {fight.blue_fighter_stance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Guardia:</span>
                            <span className="font-semibold text-gray-800">{fight.blue_fighter_stance}</span>
                          </div>
                        )}
                        {fight.blue_odds && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Cuota:</span>
                              <span className="text-2xl font-bold text-blue-600">{fight.blue_odds}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fight Result (if any) */}
                  {fight.winner_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-green-800 font-semibold">
                            ✓ Ganador: {fight.winner_name}
                          </span>
                          {fight.result_type_code && (
                            <span className="text-green-700 text-sm">
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

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/maintainers')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
          >
            ← Volver a Mantenedores
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
