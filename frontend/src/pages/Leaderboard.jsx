import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { leaderboardService } from '../services/api';

const Leaderboard = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('event');
  const [events, setEvents] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [allWinnerMessages, setAllWinnerMessages] = useState([]);
  const [winnerMessage, setWinnerMessage] = useState(null);
  const [eventResolved, setEventResolved] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [savingMessage, setSavingMessage] = useState(false);
  const [eventHasMessage, setEventHasMessage] = useState(false);

  useEffect(() => { loadInitialData(); loadAllWinnerMessages(); }, []);

  useEffect(() => {
    if (viewMode === 'event' && selectedEvent) {
      loadEventLeaderboard(selectedEvent);
    } else if (viewMode === 'event' && !selectedEvent) {
      setLeaderboard([]);
      setWinnerMessage(null);
      setEventResolved(false);
      setDraftMessage('');
      setLoading(false);
    } else if (viewMode === 'yearly' && selectedYear) {
      setWinnerMessage(null);
      setEventResolved(false);
      setDraftMessage('');
      loadYearlyLeaderboard(selectedYear);
    }
  }, [viewMode, selectedEvent, selectedYear]);

  const loadAllWinnerMessages = async () => {
    try {
      const res = await leaderboardService.getAllWinnerMessages();
      setAllWinnerMessages(res.data.data || []);
    } catch (_) {}
  };

  const loadInitialData = async () => {
    try {
      const [eventsRes, yearsRes, statusRes] = await Promise.all([
        api.get('/bets/events'),
        api.get('/leaderboard/years'),
        api.get('/config/betting-status'),
      ]);

      let closedEvents = eventsRes.data.data.filter(e => !e.betting_enabled && Number(e.pending_fights) === 0);
      if (user?.role !== 'admin') {
        closedEvents = closedEvents.filter(e => new Date(e.event_date).getFullYear() >= 2026);
      }
      // Ordenar por fecha DESC para que el más reciente quede primero
      closedEvents.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      setEvents(closedEvents);

      const status = statusRes.data.data;
      let defaultEvent = null;

      if (status?.betting_enabled && status?.current_event_id) {
        // Apuestas abiertas: intentar usar el evento vigente si está en la lista
        const found = closedEvents.find(e => e.event_id === status.current_event_id);
        defaultEvent = found ? String(found.event_id) : (closedEvents[0]?.event_id ? String(closedEvents[0].event_id) : null);
      } else {
        // Apuestas cerradas: usar el último evento finalizado
        defaultEvent = closedEvents[0]?.event_id ? String(closedEvents[0].event_id) : null;
      }

      setSelectedEvent(defaultEvent);
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
      setEventResolved(res.data.event_resolved === true);
      setEventHasMessage(res.data.event_has_message === true);
      const wm = res.data.winner_message || null;
      setWinnerMessage(wm);
      setDraftMessage(wm?.message || '');
    } catch (error) {
      console.error('Error loading event leaderboard:', error);
      setMessage({
        type: 'error',
        text: error.response?.status === 403
          ? 'Las apuestas deben estar cerradas para ver la clasificación'
          : 'Error al cargar clasificación'
      });
      setLeaderboard([]);
      setWinnerMessage(null);
      setDraftMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWinnerMessage = async () => {
    if (!selectedEvent || !draftMessage.trim()) return;
    try {
      setSavingMessage(true);
      const res = await leaderboardService.saveWinnerMessage(selectedEvent, draftMessage);
      setWinnerMessage(res.data.data);
      await loadAllWinnerMessages();
      setMessage({ type: 'success', text: 'Mensaje guardado correctamente' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar el mensaje'
      });
    } finally {
      setSavingMessage(false);
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Cargando clasificación...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Clasi<span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">ficación</span>
        </h1>
      </div>

      {/* Error/message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-xl border text-sm font-semibold ${
          message.type === 'success'
            ? 'bg-green-500/20 border-green-500/50 text-green-300'
            : 'bg-red-500/20 border-red-500/50 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* View mode tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'event', label: '📅 Por Evento' },
          { id: 'yearly', label: '📆 Clasificación Anual' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
              viewMode === tab.id
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-900/40'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selector */}
      <div className="relative mb-5 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 via-yellow-900 to-black rounded-2xl transform rotate-[0.3deg]"></div>
        <div className="relative bg-gradient-to-br from-gray-900 via-yellow-950 to-gray-900 border-2 border-yellow-700/60 rounded-2xl p-5">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
          <div className="relative z-10 flex items-center gap-4 flex-wrap">
            <label className="text-yellow-300/80 text-xs uppercase tracking-widest font-bold shrink-0">
              {viewMode === 'event' ? 'Seleccionar evento' : 'Seleccionar año'}
            </label>
            {viewMode === 'event' ? (
              <select
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="flex-1 min-w-[200px] bg-white/10 border border-white/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              >
                <option value="" className="bg-gray-900">Seleccione un evento...</option>
                {events.map((event) => (
                  <option key={event.event_id} value={event.event_id} className="bg-gray-900">
                    {event.event_name} — {formatDate(event.event_date)}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="flex-1 min-w-[200px] bg-white/10 border border-white/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year} className="bg-gray-900">{year}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Table / Empty */}
      {leaderboard.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-2 border-slate-600 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-black text-white mb-2">Sin datos</h2>
            <p className="text-white/50 text-sm">
              {viewMode === 'event'
                ? 'Selecciona un evento para ver su clasificación.'
                : 'No hay clasificación disponible para este año.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl group">
          {/* Glow layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 via-yellow-900 to-black rounded-2xl transform rotate-[0.4deg] group-hover:rotate-1 transition-transform duration-300"></div>
          <div className="relative bg-gradient-to-br from-gray-900 via-yellow-950 to-gray-900 border-2 border-yellow-700 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-shine"></div>

            {/* Header */}
            <div className="relative z-10 px-6 py-5 border-b border-yellow-700/50 flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  🏆 {viewMode === 'event' ? getEventName(selectedEvent) : `Clasificación ${selectedYear}`}
                </h2>
                <p className="text-yellow-300/70 text-sm mt-0.5">
                  {leaderboard.length} participantes
                  {viewMode === 'yearly' && leaderboard[0]?.events_participated
                    ? ` · ${leaderboard[0].events_participated} eventos`
                    : ''}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-700/30">
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-yellow-300/60 uppercase tracking-widest">Pos.</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-yellow-300/60 uppercase tracking-widest">Usuario</th>
                    {viewMode === 'yearly' && (
                      <th className="px-6 py-3 text-center text-[10px] font-bold text-yellow-300/60 uppercase tracking-widest">Eventos</th>
                    )}
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-yellow-300/60 uppercase tracking-widest">Apuestas</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-yellow-300/60 uppercase tracking-widest">Aciertos</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-yellow-300/60 uppercase tracking-widest">Precisión</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-yellow-300/60 uppercase tracking-widest">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.user_id === user?.user_id;
                    const isPodium = index < 3;
                    return (
                      <tr
                        key={entry.user_id}
                        className={`border-b border-white/5 transition-colors ${
                          isCurrentUser
                            ? 'bg-yellow-500/10'
                            : isPodium
                            ? 'bg-yellow-500/5 hover:bg-yellow-500/10'
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
                              {(entry.nickname || entry.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                                {entry.nickname || entry.username}
                                {isCurrentUser && <span className="text-yellow-400 text-xs">(Tú)</span>}
                                {user?.role === 'admin' && !entry.is_active && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-600/80 text-gray-300 border border-gray-500/50 leading-none">
                                    deshabilitado
                                  </span>
                                )}
                              </div>
                              {entry.nickname && (
                                <div className="text-xs text-white/40">@{entry.username}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Eventos (yearly only) */}
                        {viewMode === 'yearly' && (
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-semibold text-white/70">{entry.events_participated}</span>
                          </td>
                        )}

                        {/* Apuestas */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-white/70">{entry.total_bets}</span>
                        </td>

                        {/* Aciertos */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-green-500/20 border border-green-500/40 text-green-300">
                            {entry.correct_bets}
                          </span>
                        </td>

                        {/* Precisión */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-bold text-white/80">{entry.accuracy_percentage || 0}%</span>
                        </td>

                        {/* Puntos */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-lg font-black ${
                            parseFloat(entry.total_points || 0) > 0 ? 'text-yellow-400' :
                            parseFloat(entry.total_points || 0) < 0 ? 'text-red-400' :
                            'text-white/50'
                          }`}>
                            {parseFloat(entry.total_points || 0).toFixed(2)}
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

      {/* Winner messages — only for event view */}
      {viewMode === 'event' && (() => {
        // Winner of the currently selected event (if leaderboard loaded)
        const winnerOfSelected = leaderboard.length > 0 ? leaderboard[0] : null;
        const isWinnerOfSelected = winnerOfSelected?.user_id === user?.user_id && eventResolved;
        const selectedEventInt = parseInt(selectedEvent);

        // Build display list: existing messages + optional "write" slot for winner of selected event
        const displayItems = [...allWinnerMessages];
        if (isWinnerOfSelected && !eventHasMessage && selectedEvent) {
          const selInfo = events.find(e => e.event_id === selectedEventInt);
          displayItems.push({
            event_id: selectedEventInt,
            event_name: selInfo?.event_name || '',
            event_date: selInfo?.event_date || '',
            user_id: user.user_id,
            message: null,
            username: user.username,
            nickname: user.nickname,
          });
        }
        displayItems.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

        // Show pending notice for the winner of an unresolved event
        const winnerPending = winnerOfSelected?.user_id === user?.user_id && !eventResolved;

        if (displayItems.length === 0 && !winnerPending) return null;

        return (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-lg">👑</span>
              <span className="text-yellow-300 font-bold text-sm uppercase tracking-widest">Mensajes de ganadores</span>
            </div>

            {/* Notice: winner but event not yet fully resolved */}
            {winnerPending && (
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 via-yellow-900 to-black rounded-2xl transform rotate-[0.2deg]"></div>
                <div className="relative bg-gradient-to-br from-gray-900 via-yellow-950 to-gray-900 border-2 border-yellow-700/50 rounded-2xl p-4">
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="text-yellow-300 font-bold text-sm">Vas en primer lugar</p>
                      <p className="text-white/50 text-xs mt-0.5">
                        Podrás publicar tu mensaje cuando todas las peleas del evento tengan resultado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {displayItems.map((item) => {
              const isAuthor = item.user_id === user?.user_id;
              const authorName = item.nickname || item.username;
              const isNewMessage = item.message === null;

              return (
                <div key={item.event_id} className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 via-yellow-900 to-black rounded-2xl transform rotate-[0.2deg]"></div>
                  <div className="relative bg-gradient-to-br from-gray-900 via-yellow-950 to-gray-900 border-2 border-yellow-700/50 rounded-2xl p-4">
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
                    <div className="relative z-10">

                      {/* Event badge + author */}
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 px-2.5 py-0.5 rounded-full">
                            {item.event_name}
                          </span>
                          <span className="text-white/40 text-xs">
                            {item.event_date ? formatDate(item.event_date) : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-300/70 text-xs font-semibold">{authorName}</span>
                        </div>
                      </div>

                      {/* New message form (winner of selected event, no message yet) */}
                      {isNewMessage && isAuthor && (
                        <div>
                          <p className="text-white/50 text-xs mb-2">
                            ¡Ganaste este evento! Deja un mensaje para todos.
                          </p>
                          <textarea
                            value={draftMessage}
                            onChange={(e) => setDraftMessage(e.target.value.slice(0, 500))}
                            placeholder="Escribe tu mensaje aquí..."
                            rows={3}
                            className="w-full bg-white/10 border border-yellow-500/40 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-yellow-400 transition-colors placeholder-white/30"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${draftMessage.length >= 500 ? 'text-red-400' : 'text-white/40'}`}>
                              {draftMessage.length}/500
                            </span>
                            <button
                              onClick={handleSaveWinnerMessage}
                              disabled={savingMessage || !draftMessage.trim()}
                              className="px-5 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-yellow-500 to-yellow-600 text-black disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-400 hover:to-yellow-500 transition-all"
                            >
                              {savingMessage ? 'Guardando...' : 'Publicar mensaje'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Read-only message */}
                      {!isNewMessage && (
                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default Leaderboard;
