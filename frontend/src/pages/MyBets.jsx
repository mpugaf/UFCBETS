import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const MyBets = ({ eventId: propEventId, onNavigateToEvents }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [betsData, setBetsData] = useState({ total_bets: 0, events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, won: 0, lost: 0 });
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(propEventId || '');

  useEffect(() => { loadAllEvents(); }, []);

  useEffect(() => {
    const eventId = propEventId || searchParams.get('event_id');
    setSelectedEventId(eventId || '');
    loadBets(eventId);
  }, [searchParams, propEventId]);

  const loadAllEvents = async () => {
    try {
      const res = await api.get('/bets/events');
      setAllEvents(res.data.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadBets = async (filterEventId = null) => {
    try {
      setError(null);
      const eventId = filterEventId !== null ? filterEventId : (propEventId || searchParams.get('event_id'));
      const url = eventId ? `/bets/my-bets?event_id=${eventId}` : '/bets/my-bets';
      const res = await api.get(url);
      const data = res.data.data;
      const sortedEvents = [...data.events].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      setBetsData({ ...data, events: sortedEvents });
      const allBets = data.events.flatMap(e => e.bets);
      setStats({
        total: allBets.length,
        pending: allBets.filter(b => b.status === 'pending').length,
        won: allBets.filter(b => b.status === 'won').length,
        lost: allBets.filter(b => b.status === 'lost').length,
      });
    } catch (error) {
      console.error('Error loading bets:', error);
      setError(error.message || 'Error al cargar las apuestas');
    } finally {
      setLoading(false);
    }
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
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleEventFilterChange = (eventId) => {
    setSelectedEventId(eventId);
    loadBets(eventId || null);
    if (!propEventId) {
      if (eventId) setSearchParams({ event_id: eventId });
      else setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Cargando apuestas...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total', value: stats.total, color: 'indigo', border: 'border-indigo-400', via: 'via-indigo-900', glow: 'via-indigo-400/20', from: 'from-indigo-500', num: 'text-indigo-300' },
    { label: 'Pendientes', value: stats.pending, color: 'blue', border: 'border-blue-400', via: 'via-blue-900', glow: 'via-blue-400/20', from: 'from-blue-500', num: 'text-blue-300' },
    { label: 'Ganadas', value: stats.won, color: 'green', border: 'border-green-400', via: 'via-green-900', glow: 'via-green-400/20', from: 'from-green-500', num: 'text-green-300' },
    { label: 'Perdidas', value: stats.lost, color: 'red', border: 'border-red-500', via: 'via-red-900', glow: 'via-red-400/20', from: 'from-red-600', num: 'text-red-300' },
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Mis <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Apuestas</span>
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-xl mb-6">
            <p className="font-semibold">⚠️ Error al cargar las apuestas</p>
            <p className="text-sm text-white/70">{error}</p>
            <button onClick={() => loadBets()} className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold">
              Reintentar
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((s) => (
            <div key={s.label} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${s.from} to-black rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300`}></div>
              <div className={`relative bg-gradient-to-br from-gray-900 ${s.via} to-gray-900 rounded-2xl border-2 ${s.border} p-5 overflow-hidden`}>
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${s.glow} to-transparent animate-shine`}></div>
                <div className="relative z-10">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-2">{s.label}</p>
                  <p className={`text-5xl font-black ${s.num}`}>{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event Filter */}
        {allEvents.length > 0 && (
          <div className="relative mb-6 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl transform rotate-[0.3deg]"></div>
            <div className="relative bg-gradient-to-br from-gray-800 via-slate-700 to-gray-800 border-2 border-slate-500 rounded-2xl p-5">
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
              <div className="relative z-10 flex items-center gap-4 flex-wrap">
                <label className="text-white/80 text-xs uppercase tracking-widest font-bold shrink-0">Filtrar evento</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => handleEventFilterChange(e.target.value)}
                  className="flex-1 min-w-[200px] bg-white/10 border border-white/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="" className="bg-gray-900">Todos los eventos</option>
                  {allEvents
                    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
                    .map((event) => (
                      <option key={event.event_id} value={event.event_id} className="bg-gray-900">
                        {event.event_name} — {formatDate(event.event_date)}
                      </option>
                    ))}
                </select>
                {selectedEventId && (
                  <button onClick={() => handleEventFilterChange('')} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    ✕ Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {betsData.events.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl"></div>
            <div className="relative bg-gradient-to-br from-black via-slate-900 to-black border-2 border-slate-600 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-2xl font-black text-white mb-2">Sin apuestas aún</h2>
              <p className="text-white/40 mb-6 text-sm">Comienza a realizar tus pronósticos en los próximos eventos</p>
              <button
                onClick={() => onNavigateToEvents ? onNavigateToEvents() : navigate('/events')}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
              >
                Ver Eventos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {betsData.events.map((event) => {
              const wonCount = event.bets.filter(b => b.status === 'won').length;
              const lostCount = event.bets.filter(b => b.status === 'lost').length;
              const pendingCount = event.bets.filter(b => b.status === 'pending').length;

              return (
                <div key={event.event_id} className="relative group overflow-hidden rounded-2xl">
                  {/* Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-900 to-black rounded-2xl transform rotate-[0.4deg] group-hover:rotate-1 transition-transform duration-300"></div>
                  <div className="relative bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 border-2 border-red-700 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/15 to-transparent animate-shine"></div>

                    {/* Event Header */}
                    <div className="relative z-10 px-6 py-5 border-b border-red-700/60 flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-white">{event.event_name}</h2>
                        <p className="text-red-300 text-sm mt-0.5">📅 {formatDate(event.event_date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {wonCount > 0 && <span className="px-2.5 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">✓ {wonCount} ganada{wonCount !== 1 ? 's' : ''}</span>}
                        {lostCount > 0 && <span className="px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold">✗ {lostCount} perdida{lostCount !== 1 ? 's' : ''}</span>}
                        {pendingCount > 0 && <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold">⏳ {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>}
                      </div>
                    </div>

                    {/* Bets */}
                    <div className="relative z-10 p-5 space-y-3">
                      {event.bets.map((bet) => {
                        const isWon = bet.status === 'won';
                        const isLost = bet.status === 'lost';
                        const isPending = bet.status === 'pending';

                        return (
                          <div
                            key={bet.bet_id}
                            className={`rounded-xl border overflow-hidden ${
                              isWon ? 'border-green-500/60 bg-green-500/10' :
                              isLost ? 'border-red-500/60 bg-red-500/10' :
                              'border-white/20 bg-white/10'
                            }`}
                          >
                            {/* Bet header bar */}
                            <div className={`px-4 py-2 flex justify-between items-center ${
                              isWon ? 'bg-green-500/30' :
                              isLost ? 'bg-red-500/30' :
                              'bg-white/10'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-base">{getCategoryIcon(bet.category_code)}</span>
                                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                                  {bet.category_name || 'Sin categoría'}
                                </span>
                                {!!bet.is_title_fight && (
                                  <span className="text-xs bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 px-1.5 py-0.5 rounded font-bold">TÍTULO</span>
                                )}
                              </div>
                              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                                isWon ? 'bg-green-500/30 text-green-300' :
                                isLost ? 'bg-red-500/30 text-red-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {isPending ? '⏳ Pendiente' : isWon ? '✓ Ganada' : '✗ Perdida'}
                              </span>
                            </div>

                            <div className="px-4 py-3">
                              {/* Fighters */}
                              <div className="mb-3">
                                <p className="text-white font-black text-base">
                                  {bet.red_fighter_name}
                                  <span className="text-white/30 mx-2 font-normal">vs</span>
                                  {bet.blue_fighter_name}
                                </p>
                                <p className="text-white/50 text-xs mt-0.5">{bet.weight_class_name}</p>
                              </div>

                              {/* Stats row */}
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white/10 rounded-lg p-3 border border-white/15">
                                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Tu Pronóstico</p>
                                  <p className="text-sm font-bold">
                                    {bet.bet_type === 'draw' ? (
                                      <span className="text-yellow-400">⚖️ Empate</span>
                                    ) : (
                                      <span className={bet.predicted_winner_id === bet.red_fighter_id ? 'text-red-400' : 'text-blue-400'}>
                                        {bet.predicted_winner_id === bet.red_fighter_id ? '🔴' : '🔵'} {bet.predicted_winner_name}
                                      </span>
                                    )}
                                  </p>
                                </div>

                                <div className="bg-white/10 rounded-lg p-3 border border-white/15">
                                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Cuota</p>
                                  <p className="text-xl font-black text-indigo-400">{bet.odds_value}x</p>
                                </div>

                                <div className="bg-white/10 rounded-lg p-3 border border-white/15">
                                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Ganancia</p>
                                  <p className="text-xl font-black text-green-400">{bet.potential_return}<span className="text-xs font-normal text-white/50 ml-1">pts</span></p>
                                </div>
                              </div>

                              {/* Actual result */}
                              {bet.actual_winner_name && (
                                <div className={`mt-3 px-3 py-2 rounded-lg flex items-center justify-between ${
                                  isWon ? 'bg-green-500/20 border border-green-500/50' :
                                  isLost ? 'bg-red-500/20 border border-red-500/50' :
                                  'bg-white/10 border border-white/20'
                                }`}>
                                  <div>
                                    <span className="text-white/50 text-[10px] uppercase tracking-wider">Resultado real — </span>
                                    <span className={`text-sm font-bold ${isWon ? 'text-green-400' : isLost ? 'text-red-400' : 'text-white/70'}`}>
                                      {bet.actual_winner_name}
                                    </span>
                                  </div>
                                  {isWon && <span className="text-green-400 text-xs font-black">¡ACERTASTE!</span>}
                                  {isLost && <span className="text-red-400 text-xs font-black">NO ACERTASTE</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;
