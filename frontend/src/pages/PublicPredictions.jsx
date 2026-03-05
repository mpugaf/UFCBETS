import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PublicPredictions = ({ eventId: propEventId }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState({ categories: [] });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(propEventId || '');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (propEventId) {
      setSelectedEvent(propEventId);
      loadPredictions(propEventId);
    } else {
      setLoading(false);
    }
  }, [propEventId]);

  const loadEvents = async () => {
    try {
      const res = await api.get('/bets/events');
      setEvents(res.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    setSelectedUser(null);
    loadPredictions(eventId);
  };

  const handleEventChangeInUserView = (eventId) => {
    setSelectedEvent(eventId);
    loadPredictions(eventId);
  };

  const handleUserChange = (userId) => {
    const u = allUsers.find(u => u.user_id === parseInt(userId));
    setSelectedUser(u || null);
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

      const userMap = {};
      res.data.data.categories.forEach(category => {
        category.fights.forEach(fight => {
          fight.predictions.forEach(pred => {
            if (!userMap[pred.user_id]) {
              userMap[pred.user_id] = {
                user_id: pred.user_id,
                username: pred.username,
                nickname: pred.user_nickname,
                is_active: pred.user_is_active,
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

  const getEnabledUsers = () => users.filter(u => u.is_active);

  const calculateRanking = () => {
    const ranking = [];
    getEnabledUsers().forEach(u => {
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

    return ranking.sort((a, b) => {
      if (b.net_profit !== a.net_profit) return b.net_profit - a.net_profit;
      return b.correct_bets - a.correct_bets;
    });
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}°`;
  };

  const getPredictionText = (prediction, fight) => {
    if (prediction.bet_type === 'draw') return 'Empate';
    return prediction.predicted_winner_name;
  };

  const getPredictionStatus = (prediction, fight) => {
    if (fight.winner_id === null && !fight.is_draw && fight.result_type_code !== 'no_contest') {
      return { status: 'pending', label: 'Pendiente', icon: '⏳' };
    }
    if (fight.result_type_code === 'no_contest') {
      return { status: 'pending', label: 'No Contest', icon: '🚫' };
    }
    let isCorrect = false;
    if (fight.is_draw) {
      isCorrect = prediction.bet_type === 'draw';
    } else if (prediction.bet_type === 'no_contest') {
      isCorrect = fight.result_type_code === 'no_contest';
    } else {
      isCorrect = prediction.predicted_winner_id === fight.winner_id;
    }
    if (isCorrect) return { status: 'won', label: 'Acertado', icon: '✓' };
    return { status: 'lost', label: 'Fallado', icon: '✗' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Cargando pronósticos...</div>
      </div>
    );
  }

  // ── User Detail View ──────────────────────────────────────────────────────
  if (selectedUser) {
    const userPredictions = getUserPredictions(selectedUser.user_id);
    const statusStyles = {
      won: 'bg-green-500/20 border-green-500/40 text-green-300',
      lost: 'bg-red-500/20 border-red-500/40 text-red-300',
      pending: 'bg-white/10 border-white/20 text-white/60',
    };

    return (
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Pronósti<span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">cos</span>
          </h1>
        </div>

        {/* Back + Event selector */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shrink-0"
          >
            ← Volver
          </button>
          <div className="relative flex-1 overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-900 to-black rounded-xl transform rotate-[0.3deg]"></div>
            <div className="relative bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 border border-red-700/60 rounded-xl px-4 py-2.5 overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
              <select
                value={selectedEvent}
                onChange={(e) => handleEventChangeInUserView(e.target.value)}
                className="relative z-10 w-full bg-transparent text-white text-sm font-semibold focus:outline-none"
              >
                {events.map((evt) => (
                  <option key={evt.event_id} value={evt.event_id} className="bg-gray-900">
                    {evt.event_name} — {new Date(evt.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* User header card */}
        <div className="relative mb-5 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-900 to-black rounded-2xl transform rotate-[0.4deg]"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 border-2 border-red-700 rounded-2xl p-5 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-shine"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {(selectedUser.nickname || selectedUser.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{selectedUser.nickname || selectedUser.username}</h2>
                {selectedUser.nickname && <p className="text-white/40 text-sm">@{selectedUser.username}</p>}
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-black text-red-400">{userPredictions.length}</p>
                <p className="text-white/40 text-xs uppercase tracking-wider">Pronósticos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fight cards */}
        <div className="space-y-4">
          {userPredictions.map((fight) => {
            const predStatus = getPredictionStatus(fight.user_prediction, fight);
            const isRed = fight.user_prediction.predicted_winner_id === fight.red_fighter.fighter_id;
            const isDraw = fight.user_prediction.bet_type === 'draw';

            return (
              <div key={fight.fight_id} className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl transform rotate-[0.2deg]"></div>
                <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border border-slate-600 rounded-2xl p-5 overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
                  <div className="relative z-10">
                    {/* Category badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">
                        {fight.category_code === 'title_fight' ? '🏆' : fight.category_code === 'main_card' ? '⭐' : '🥊'}
                      </span>
                      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{fight.category_name}</span>
                      {!!fight.is_title_fight && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-yellow-500 text-black">🏆 TÍTULO</span>
                      )}
                    </div>

                    {/* Weight class */}
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{fight.weight_class_name}</p>

                    {/* Fighters */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 text-center">
                        <p className={`font-black text-base leading-tight ${!isDraw && isRed ? 'text-red-400 text-lg' : 'text-white/60'}`}>
                          🔴 {fight.red_fighter.fighter_name}
                        </p>
                      </div>
                      <div className="px-4 text-white/30 font-black text-sm">VS</div>
                      <div className="flex-1 text-center">
                        <p className={`font-black text-base leading-tight ${!isDraw && !isRed ? 'text-blue-400 text-lg' : 'text-white/60'}`}>
                          🔵 {fight.blue_fighter.fighter_name}
                        </p>
                      </div>
                    </div>

                    {/* Prediction row */}
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Pronóstico</p>
                        <p className="text-white font-black text-base">{getPredictionText(fight.user_prediction, fight)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-white/40 text-xs">Cuota</p>
                          <p className="text-white font-black">{fight.user_prediction.odds_value}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black border ${statusStyles[predStatus.status]}`}>
                          {predStatus.icon} {predStatus.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Users List View ───────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Pronósti<span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">cos</span>
        </h1>
      </div>

      {/* Error message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-xl border text-sm font-semibold ${
          message.type === 'success'
            ? 'bg-green-500/20 border-green-500/50 text-green-300'
            : 'bg-red-500/20 border-red-500/50 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {!selectedEvent ? (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-2 border-slate-600 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-black text-white mb-2">Sin evento</h2>
            <p className="text-white/50 text-sm">Selecciona un evento desde la lista de eventos.</p>
          </div>
        </div>
      ) : getEnabledUsers().length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-2 border-slate-600 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-black text-white mb-2">Pronósticos No Disponibles</h2>
            <p className="text-white/50 text-sm">
              {message.text || 'Los pronósticos solo son visibles cuando las apuestas están cerradas.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl group">
          {/* Glow layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-900 to-black rounded-2xl transform rotate-[0.4deg] group-hover:rotate-1 transition-transform duration-300"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 border-2 border-red-700 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-shine"></div>

            {/* Header */}
            <div className="relative z-10 px-6 py-5 border-b border-red-700/50">
              <h2 className="text-2xl font-black text-white">
                📊 {events.find(e => e.event_id === parseInt(selectedEvent))?.event_name}
              </h2>
              <p className="text-red-300/70 text-sm mt-0.5">{getEnabledUsers().length} participantes · haz clic para ver pronósticos</p>
            </div>

            {/* Table */}
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-red-700/30">
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Pos.</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Usuario</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Apuestas</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Aciertos</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Errores</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Pendientes</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Precisión</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-red-300/60 uppercase tracking-widest">Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateRanking().map((stats, index) => {
                    const isCurrentUser = stats.user_id === user?.user_id;
                    const isPodium = index < 3;
                    const accuracy = stats.total_bets > 0
                      ? ((stats.correct_bets / (stats.correct_bets + stats.incorrect_bets)) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr
                        key={stats.user_id}
                        onClick={() => setSelectedUser(users.find(u => u.user_id === stats.user_id))}
                        className={`border-b border-white/5 cursor-pointer transition-colors ${
                          isCurrentUser
                            ? 'bg-red-500/10'
                            : isPodium
                            ? 'bg-red-500/5 hover:bg-red-500/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {/* Position */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-2xl font-black">{getMedalEmoji(index)}</span>
                        </td>

                        {/* User */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-lg ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                              index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                              index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' :
                              'bg-gradient-to-br from-red-700 to-red-900 text-white'
                            }`}>
                              {(stats.nickname || stats.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">
                                {stats.nickname || stats.username}
                                {isCurrentUser && <span className="ml-2 text-red-400 text-xs">(Tú)</span>}
                              </div>
                              {stats.nickname && (
                                <div className="text-xs text-white/40">@{stats.username}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Apuestas */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-white/70">{stats.total_bets}</span>
                        </td>

                        {/* Aciertos */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-green-500/20 border border-green-500/40 text-green-300">
                            {stats.correct_bets}
                          </span>
                        </td>

                        {/* Errores */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-red-500/20 border border-red-500/40 text-red-300">
                            {stats.incorrect_bets}
                          </span>
                        </td>

                        {/* Pendientes */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-white/50">{stats.pending_bets}</span>
                        </td>

                        {/* Precisión */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-bold text-white/80">{accuracy}%</span>
                        </td>

                        {/* Ganancia */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-lg font-black ${
                            stats.net_profit > 0 ? 'text-green-400' :
                            stats.net_profit < 0 ? 'text-red-400' :
                            'text-white/50'
                          }`}>
                            {stats.net_profit > 0 ? '+' : ''}{stats.net_profit.toFixed(2)}
                            <span className="text-xs font-normal text-white/40 ml-1">pts</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPredictions;
