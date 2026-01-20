import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const MyBets = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [betsData, setBetsData] = useState({ total_bets: 0, events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, won: 0, lost: 0 });

  useEffect(() => {
    loadBets();
  }, [searchParams]);

  const loadBets = async () => {
    try {
      setError(null);
      const eventId = searchParams.get('event_id');
      const url = eventId ? `/bets/my-bets?event_id=${eventId}` : '/bets/my-bets';
      const res = await api.get(url);
      const data = res.data.data;
      setBetsData(data);

      // Calculate stats from all bets across all events
      const allBets = data.events.flatMap(event => event.bets);
      const stats = {
        total: allBets.length,
        pending: allBets.filter(b => b.status === 'pending').length,
        won: allBets.filter(b => b.status === 'won').length,
        lost: allBets.filter(b => b.status === 'lost').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading bets:', error);
      setError(error.message || 'Error al cargar las apuestas');
    } finally {
      setLoading(false);
    }
  };

  const getBetTypeLabel = (bet) => {
    if (bet.bet_type === 'draw') {
      return '⚖️ Empate';
    }
    return bet.predicted_winner_name;
  };

  const getCategoryIcon = (categoryCode) => {
    switch (categoryCode) {
      case 'title_fight': return '🏆';
      case 'main_card': return '⭐';
      case 'preliminary': return '🥊';
      default: return '🥋';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando apuestas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">📋 Mis Apuestas</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/events')} className="text-white hover:text-white/80 font-medium">Eventos</button>
              <button onClick={() => navigate('/betting')} className="text-white hover:text-white/80 font-medium">Apostar</button>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            <p className="font-semibold">⚠️ Error al cargar las apuestas</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => loadBets()}
              className="mt-2 px-4 py-2 bg-white text-red-500 rounded font-semibold hover:bg-red-50"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Total Apuestas</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Pendientes</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Ganadas</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{stats.won}</p>
          </div>
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Perdidas</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{stats.lost}</p>
          </div>
        </div>

        {/* Bets List by Event */}
        {betsData.events.length === 0 ? (
          <div className="bg-white/95 rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No tienes apuestas</h2>
            <p className="text-gray-600 mb-6">Comienza a realizar tus pronósticos en los próximos eventos</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              Ver Eventos Disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {betsData.events.map((event) => (
              <div key={event.event_id} className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
                {/* Event Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{event.event_name}</h2>
                      <p className="text-white/90">{formatDate(event.event_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{event.bets.length}</p>
                      <p className="text-sm text-white/80">apuesta{event.bets.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Event Bets */}
                <div className="p-6">
                  <div className="space-y-4">
                    {event.bets.map((bet) => (
                      <div
                        key={bet.bet_id}
                        className={`rounded-xl border-2 overflow-hidden transition-all ${
                          bet.status === 'pending' ? 'border-blue-300 bg-blue-50' :
                          bet.status === 'won' ? 'border-green-300 bg-green-50' :
                          bet.status === 'lost' ? 'border-red-300 bg-red-50' :
                          'border-gray-300 bg-gray-50'
                        }`}
                      >
                        {/* Status Badge */}
                        <div className={`px-4 py-2 flex justify-between items-center ${
                          bet.status === 'pending' ? 'bg-blue-500' :
                          bet.status === 'won' ? 'bg-green-500' :
                          bet.status === 'lost' ? 'bg-red-500' : 'bg-gray-500'
                        } text-white`}>
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {getCategoryIcon(bet.category_code)}
                            </span>
                            <span className="font-medium">
                              {bet.category_name || 'Sin categoría'}
                            </span>
                            {bet.is_title_fight && (
                              <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-bold">
                                TÍTULO
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-semibold px-3 py-1 bg-white/20 rounded-full">
                            {bet.status === 'pending' ? '⏳ Pendiente' :
                             bet.status === 'won' ? '✓ Ganada' :
                             bet.status === 'lost' ? '✗ Perdida' : bet.status}
                          </span>
                        </div>

                        <div className="p-4">
                          {/* Fight Info */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Pelea</p>
                            <p className="text-lg font-bold text-gray-800">
                              {bet.red_fighter_name}
                              <span className="text-gray-400 mx-2">vs</span>
                              {bet.blue_fighter_name}
                            </p>
                            <p className="text-sm text-gray-500">{bet.weight_class_name}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Your Prediction */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 mb-1 font-medium">Tu Pronóstico</p>
                              <p className="font-bold text-gray-800">
                                {bet.bet_type === 'draw' ? (
                                  <span className="text-purple-600">⚖️ Empate</span>
                                ) : (
                                  <span className={
                                    bet.predicted_winner_id === bet.red_fighter_id
                                      ? 'text-red-600'
                                      : 'text-blue-600'
                                  }>
                                    {bet.predicted_winner_id === bet.red_fighter_id ? '🔴' : '🔵'} {bet.predicted_winner_name}
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Odds */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 mb-1 font-medium">Cuota</p>
                              <p className="text-xl font-bold text-purple-600">{bet.odds_value}x</p>
                            </div>

                            {/* Potential Return */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 mb-1 font-medium">Ganancia Potencial</p>
                              <p className="text-xl font-bold text-green-600">
                                {bet.potential_return} pts
                              </p>
                            </div>
                          </div>

                          {/* Actual Winner */}
                          {bet.actual_winner_name && (
                            <div className={`mt-4 p-3 rounded-lg ${
                              bet.status === 'won' ? 'bg-green-100 border border-green-300' :
                              bet.status === 'lost' ? 'bg-red-100 border border-red-300' :
                              'bg-gray-100 border border-gray-300'
                            }`}>
                              <p className="text-xs font-medium text-gray-600 mb-1">Resultado Real</p>
                              <p className="font-bold text-gray-800">
                                {bet.actual_winner_name}
                                {bet.status === 'won' && (
                                  <span className="ml-2 text-green-600">✓ ¡Acertaste!</span>
                                )}
                                {bet.status === 'lost' && (
                                  <span className="ml-2 text-red-600">✗ No acertaste</span>
                                )}
                              </p>
                              {bet.result_points > 0 && (
                                <p className="text-sm text-green-600 font-semibold mt-1">
                                  +{bet.result_points} puntos ganados
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;
