import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PublicPredictions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [predictions, setPredictions] = useState({ categories: [] });
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [viewMode, setViewMode] = useState('users'); // 'users' or 'ranking'
  const [yearlyRanking, setYearlyRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const eventId = searchParams.get('event_id');
    if (eventId) {
      setSelectedEvent(eventId);
      loadPredictions(eventId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (viewMode === 'ranking' && selectedEvent) {
      loadYearlyRanking();
    }
  }, [viewMode, selectedEvent]);

  const loadEvents = async () => {
    try {
      const res = await api.get('/bets/events');
      setEvents(res.data.data);

      // Load all users for the dropdown
      const usersRes = await api.get('/maintainers/users');
      setAllUsers(usersRes.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    setSelectedUser(null);
    setSearchParams({ event_id: eventId });
  };

  const handleEventChangeInUserView = (eventId) => {
    setSelectedEvent(eventId);
    // NO limpiar selectedUser, mantenerlo para que se quede en la vista del usuario
    setSearchParams({ event_id: eventId });
  };

  const handleUserChange = (userId) => {
    const user = allUsers.find(u => u.user_id === parseInt(userId));
    setSelectedUser(user || null);
  };

  const loadPredictions = async (eventId) => {
    try {
      if (!eventId) {
        setMessage({ type: 'error', text: 'Debes seleccionar un evento' });
        setLoading(false);
        return;
      }

      setLoading(true);
      const res = await api.get(`/bets/predictions/${eventId}`);
      setPredictions(res.data.data);

      // Extract unique users from predictions
      const userMap = {};
      res.data.data.categories.forEach(category => {
        category.fights.forEach(fight => {
          fight.predictions.forEach(pred => {
            if (!userMap[pred.user_id]) {
              userMap[pred.user_id] = {
                user_id: pred.user_id,
                username: pred.username,
                nickname: pred.user_nickname,
                total_bets: 0
              };
            }
            userMap[pred.user_id].total_bets++;
          });
        });
      });

      setUsers(Object.values(userMap).sort((a, b) => a.nickname?.localeCompare(b.nickname) || a.username.localeCompare(b.username)));
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error loading predictions:', error);
      if (error.response?.status === 403) {
        setMessage({ type: 'error', text: error.response.data.message || 'Las apuestas aún están abiertas' });
      } else {
        setMessage({ type: 'error', text: 'Error al cargar pronósticos' });
      }
      setPredictions({ categories: [] });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyRanking = async () => {
    try {
      // Get the year from the selected event
      const event = events.find(e => e.event_id === parseInt(selectedEvent));
      if (!event) return;

      const year = new Date(event.event_date).getFullYear();
      const res = await api.get(`/leaderboard/year/${year}`);
      setYearlyRanking(res.data.data);
    } catch (error) {
      console.error('Error loading yearly ranking:', error);
      setYearlyRanking([]);
    }
  };

  const getUserPredictions = (userId) => {
    const userPredictions = [];
    predictions.categories.forEach(category => {
      category.fights.forEach(fight => {
        const userPred = fight.predictions.find(p => p.user_id === userId);
        if (userPred) {
          userPredictions.push({
            ...fight,
            category_name: category.category_name,
            category_code: category.category_code,
            user_prediction: userPred
          });
        }
      });
    });
    return userPredictions;
  };

  const calculateRanking = () => {
    const ranking = [];

    users.forEach(u => {
      const userStats = {
        user_id: u.user_id,
        username: u.username,
        nickname: u.nickname,
        total_bets: 0,
        correct_bets: 0,
        incorrect_bets: 0,
        pending_bets: 0,
        total_won: 0,
        total_lost: 0,
        net_profit: 0
      };

      predictions.categories.forEach(category => {
        category.fights.forEach(fight => {
          const userPred = fight.predictions.find(p => p.user_id === u.user_id);

          if (userPred) {
            userStats.total_bets++;

            // Check if fight has a result
            if (fight.winner_id !== null || fight.is_draw) {
              const isCorrect = fight.is_draw
                ? userPred.bet_type === 'draw'
                : userPred.predicted_winner_id === fight.winner_id;

              if (isCorrect) {
                userStats.correct_bets++;
                userStats.total_won += parseFloat(userPred.potential_return || 0);
              } else {
                userStats.incorrect_bets++;
                userStats.total_lost += parseFloat(userPred.bet_amount || 100);
              }
            } else {
              userStats.pending_bets++;
            }
          }
        });
      });

      userStats.net_profit = userStats.total_won - userStats.total_lost;
      ranking.push(userStats);
    });

    // Sort by net profit descending, then by correct bets
    return ranking.sort((a, b) => {
      if (b.net_profit !== a.net_profit) {
        return b.net_profit - a.net_profit;
      }
      return b.correct_bets - a.correct_bets;
    });
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}°`;
  };

  const getPredictionIcon = (prediction, fight) => {
    if (prediction.bet_type === 'draw') {
      return <span className="text-3xl">⚖️</span>;
    }

    if (prediction.predicted_winner_id === fight.red_fighter.fighter_id) {
      return <span className="text-red-600 text-3xl font-bold">🔴</span>;
    }

    return <span className="text-blue-600 text-3xl font-bold">🔵</span>;
  };

  const getPredictionText = (prediction, fight) => {
    if (prediction.bet_type === 'draw') {
      return 'Empate';
    }
    return prediction.predicted_winner_name;
  };

  const getPredictionStatus = (prediction, fight) => {
    // Check if fight has a result
    if (fight.winner_id === null && !fight.is_draw && fight.result_type_code !== 'no_contest') {
      return { status: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-800', icon: '⏳' };
    }

    // No contest - all bets are pending
    if (fight.result_type_code === 'no_contest') {
      return { status: 'pending', label: 'No Contest', color: 'bg-orange-100 text-orange-800', icon: '🚫' };
    }

    // Check if prediction is correct
    let isCorrect = false;
    if (fight.is_draw) {
      isCorrect = prediction.bet_type === 'draw';
    } else if (prediction.bet_type === 'no_contest') {
      isCorrect = fight.result_type_code === 'no_contest';
    } else {
      isCorrect = prediction.predicted_winner_id === fight.winner_id;
    }

    if (isCorrect) {
      return { status: 'won', label: 'Acertado', color: 'bg-green-100 text-green-800', icon: '✓' };
    } else {
      return { status: 'lost', label: 'Fallado', color: 'bg-red-100 text-red-800', icon: '✗' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando pronósticos...</div>
      </div>
    );
  }

  // User Detail View
  if (selectedUser) {
    const userPredictions = getUserPredictions(selectedUser.user_id);

    return (
      <div className="min-h-screen">
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <span className="text-2xl font-bold text-white">👁️ Pronósticos de {selectedUser.nickname || selectedUser.username}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
                <button onClick={() => navigate('/events')} className="text-white hover:text-white/80 font-medium">Eventos</button>
                {user?.role === 'admin' && (
                  <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
                )}
                <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button and Event Selector */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              ← Volver a la lista
            </button>

            <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-lg p-3">
              <select
                value={selectedEvent}
                onChange={(e) => handleEventChangeInUserView(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 font-semibold"
              >
                <option value="">Seleccionar evento...</option>
                {events.map((evt) => (
                  <option key={evt.event_id} value={evt.event_id}>
                    {evt.event_name} - {new Date(evt.event_date).toLocaleDateString('es-ES')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Stats */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{selectedUser.nickname || selectedUser.username}</h2>
                {selectedUser.nickname && <p className="text-gray-600">@{selectedUser.username}</p>}
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600">{userPredictions.length}</p>
                <p className="text-gray-600">Pronósticos</p>
              </div>
            </div>
          </div>

          {/* User Predictions */}
          <div className="space-y-4">
            {userPredictions.map((fight) => (
              <div key={fight.fight_id} className="bg-white rounded-lg shadow-md p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {fight.category_code === 'title_fight' ? '🏆' :
                     fight.category_code === 'main_card' ? '⭐' : '🥊'}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">{fight.category_name}</span>
                </div>

                {/* Fight Info */}
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{fight.weight_class_name || 'Peso no especificado'}</h4>
                  {fight.is_title_fight && (
                    <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full mb-2">
                      TITLE FIGHT
                    </span>
                  )}
                </div>

                {/* Fighters */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  <div className="text-center flex-1">
                    <div className="text-red-600 font-bold text-lg">🔴 {fight.red_fighter.fighter_name}</div>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-gray-500 font-bold text-xl">VS</span>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-blue-600 font-bold text-lg">🔵 {fight.blue_fighter.fighter_name}</div>
                  </div>
                </div>

                {/* User's Prediction */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getPredictionIcon(fight.user_prediction, fight)}
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Pronóstico:</p>
                        <p className="text-xl font-bold text-gray-800">{getPredictionText(fight.user_prediction, fight)}</p>
                        {(() => {
                          const predictionStatus = getPredictionStatus(fight.user_prediction, fight);
                          return (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-2 ${predictionStatus.color}`}>
                              <span>{predictionStatus.icon}</span>
                              <span>{predictionStatus.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Cuota</p>
                      <p className="text-2xl font-bold text-purple-600">{fight.user_prediction.odds_value}</p>
                      <p className="text-xs text-gray-500">Ganancia: {fight.user_prediction.potential_return} pts</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Users List View
  return (
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">👁️ Pronósticos Públicos</span>
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

        {!selectedEvent ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🗓️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Selecciona un Evento</h2>
            <p className="text-gray-600 mb-6">
              Para ver los pronósticos públicos, primero selecciona un evento desde la lista de eventos.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Ver Lista de Eventos
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Pronósticos No Disponibles</h2>
            <p className="text-gray-600 mb-6">
              {message.text || 'Los pronósticos solo son visibles cuando hay resultados disponibles o las apuestas están cerradas.'}
            </p>
            <button
              onClick={() => navigate('/events')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Ver Eventos
            </button>
          </div>
        ) : (
          <>
            {/* View Mode Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setViewMode('users')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  viewMode === 'users'
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                👤 Ver por Usuario
              </button>
              <button
                onClick={() => setViewMode('ranking')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  viewMode === 'ranking'
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🏆 Ranking General
              </button>
            </div>

            {viewMode === 'ranking' ? (
              <>
                {/* Ranking View */}
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-white mb-2">🏆 Ranking Anual</h1>
                  <p className="text-white/80">Puntos totales acumulados en todos los eventos del año</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pos</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Usuario</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Eventos</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Apuestas</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Aciertos</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Errores</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Precisión</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Invertido</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Retorno</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Ganancia Neta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {yearlyRanking.map((stats, index) => {
                          const isCurrentUser = stats.user_id === user?.user_id;
                          return (
                            <tr
                              key={stats.user_id}
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
                                    {(stats.nickname || stats.username).charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-800">
                                      {stats.nickname || stats.username}
                                      {isCurrentUser && <span className="ml-2 text-purple-600">(Tú)</span>}
                                    </div>
                                    {stats.nickname && (
                                      <div className="text-xs text-gray-500">@{stats.username}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-sm text-gray-700">{stats.events_participated || 0}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-sm text-gray-700">{stats.total_bets}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                  {stats.correct_bets}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                  {stats.incorrect_bets}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-sm font-semibold text-blue-600">
                                  {stats.accuracy_percentage || 0}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-sm font-semibold text-gray-700">
                                  {stats.total_invested || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-sm font-semibold text-blue-600">
                                  {stats.total_return || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`text-lg font-bold ${
                                  stats.total_points > 0
                                    ? 'text-green-600'
                                    : stats.total_points < 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }`}>
                                  {stats.total_points > 0 ? '+' : ''}{stats.total_points}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Users List View */}
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-white mb-2">Selecciona un Usuario</h1>
                  <p className="text-white/80">Haz clic en un usuario para ver todos sus pronósticos</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => setSelectedUser(u)}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {(u.nickname || u.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{u.total_bets}</p>
                      <p className="text-xs text-gray-500">pronósticos</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{u.nickname || u.username}</h3>
                  {u.nickname && <p className="text-sm text-gray-500">@{u.username}</p>}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-purple-600 font-semibold text-sm">Ver pronósticos →</p>
                  </div>
                </button>
              ))}
            </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicPredictions;
