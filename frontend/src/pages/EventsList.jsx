import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EventsList = ({ onNavigateToBetting, onNavigateToMyBets, onNavigateToPublicPredictions, onNavigateToCartelera }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bettingStatus, setBettingStatus] = useState(null);

  useEffect(() => {
    loadEvents();
    loadBettingStatus();
  }, []);

  const loadBettingStatus = async () => {
    try {
      const res = await api.get('/config/betting-status');
      setBettingStatus(res.data.data);
    } catch (error) {
      console.error('Error loading betting status:', error);
    }
  };

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

  const visibleEvents = events.filter(event => {
    if (user?.role !== 'admin') {
      const eventYear = new Date(event.event_date).getFullYear();
      if (eventYear < 2026) return false;
    }
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleEventClick = (event) => {
    if (event.event_status === 'upcoming' || event.event_status === 'today') {
      if (user?.role !== 'admin' && onNavigateToBetting) onNavigateToBetting(event.event_id);
    } else {
      if (user?.role === 'admin') {
        if (onNavigateToPublicPredictions) onNavigateToPublicPredictions(event.event_id);
      } else {
        if (onNavigateToMyBets) onNavigateToMyBets(event.event_id);
      }
    }
  };

  const handleViewPredictions = (event, e) => {
    e.stopPropagation();
    if (onNavigateToPublicPredictions) onNavigateToPublicPredictions(event.event_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Eventos <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">UFC</span>
        </h1>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-white/60 text-lg">No hay eventos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleEvents.map((event) => {
            const isOpen = bettingStatus?.betting_enabled &&
                           bettingStatus?.current_event_id === event.event_id;
            const isPast = event.event_status === 'past';
            const isToday = event.event_status === 'today';
            const isUpcoming = event.event_status === 'upcoming';

            return (
              <div
                key={event.event_id}
                onClick={() => handleEventClick(event)}
                className="relative group cursor-pointer"
              >
                {/* Glow layer */}
                <div className={`absolute inset-0 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300 ${
                  isOpen
                    ? 'bg-gradient-to-br from-green-600 via-emerald-700 to-black'
                    : isPast
                    ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-black'
                    : 'bg-gradient-to-br from-red-700 via-red-800 to-black'
                }`}></div>

                {/* Card */}
                <div className={`relative rounded-2xl p-5 border-2 text-white overflow-hidden transform hover:scale-[1.02] transition-all duration-300 ${
                  isOpen
                    ? 'bg-gradient-to-br from-black via-green-950 to-black border-green-500 shadow-lg shadow-green-900/40'
                    : isPast
                    ? 'bg-gradient-to-br from-black via-slate-900 to-black border-slate-600'
                    : 'bg-gradient-to-br from-black via-red-950 to-black border-red-700'
                }`}>
                  {/* Diagonal pattern */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)'
                  }}></div>

                  {/* Shine */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-shine ${
                    isOpen ? 'via-green-400/10' : isPast ? 'via-slate-400/10' : 'via-red-400/10'
                  }`}></div>

                  <div className="relative z-10">
                    {/* Top badges */}
                    <div className="flex items-center gap-2 mb-3">
                      {isOpen && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-green-500 text-white animate-pulse shadow shadow-green-500/50">
                          ⚡ ABIERTO
                        </span>
                      )}
                      {isToday && !isOpen && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-black">
                          HOY
                        </span>
                      )}
                      {isUpcoming && !isOpen && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                          PRÓXIMO
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-600 text-white/80">
                          FINALIZADO
                        </span>
                      )}
                    </div>

                    {/* Event name */}
                    <h3 className={`text-lg font-black mb-1 leading-tight ${
                      isOpen ? 'text-green-300' : isPast ? 'text-white/80' : 'text-white'
                    }`}>
                      {event.event_name}
                    </h3>

                    {/* Date */}
                    <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                      <span>📅</span> {formatDate(event.event_date)}
                    </p>

                    {/* Location */}
                    {event.venue && (
                      <p className="text-white/40 text-xs mb-4 flex items-center gap-1">
                        <span>📍</span> {event.venue}, {event.city}
                      </p>
                    )}

                    {/* Stats */}
                    <div className={`grid grid-cols-3 gap-2 pt-3 border-t mb-3 ${
                      isOpen ? 'border-green-500/30' : isPast ? 'border-slate-600/30' : 'border-red-700/30'
                    }`}>
                      <div className="text-center">
                        <p className="text-xl font-black text-white">{event.total_fights}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Peleas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-white">{event.pending_fights}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Pendientes</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-xl font-black ${event.user_bets > 0 ? (isOpen ? 'text-green-400' : 'text-yellow-400') : 'text-white'}`}>
                          {event.user_bets}
                        </p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Mis apuestas</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {isOpen ? (
                        <>
                          {user?.role !== 'admin' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onNavigateToBetting(event.event_id); }}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-2.5 px-4 rounded-lg font-black text-sm transition-all shadow-lg shadow-green-900/50 hover:scale-105 flex items-center justify-center gap-2"
                            >
                              🥊 Apostar Ahora
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onNavigateToCartelera(event.event_id); }}
                              className="w-full bg-red-800/60 hover:bg-red-700/70 border border-red-600/50 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              Cartelera
                            </button>
                            <button
                              onClick={(e) => handleViewPredictions(event, e)}
                              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Ver Pronósticos
                            </button>
                          </div>
                        </>
                      ) : isPast ? (
                        <>
                          {user?.role !== 'admin' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onNavigateToMyBets(event.event_id); }}
                              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                            >
                              🎟️ Ver Mis Apuestas
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onNavigateToCartelera(event.event_id); }}
                              className="w-full bg-red-800/60 hover:bg-red-700/70 border border-red-600/50 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              Cartelera
                            </button>
                            <button
                              onClick={(e) => handleViewPredictions(event, e)}
                              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Ver Pronósticos
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {user?.role !== 'admin' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onNavigateToBetting(event.event_id); }}
                              className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white py-2.5 px-4 rounded-lg font-black text-sm transition-all flex items-center justify-center gap-2"
                            >
                              🥊 Apostar
                            </button>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onNavigateToCartelera(event.event_id); }}
                              className="w-full bg-red-800/60 hover:bg-red-700/70 border border-red-600/50 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              Cartelera
                            </button>
                            <button
                              onClick={(e) => handleViewPredictions(event, e)}
                              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                            >
                              Ver Pronósticos
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsList;
