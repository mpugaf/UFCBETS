import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Importar componentes de las diferentes secciones
import EventsList from './EventsList';
import Betting from './Betting';
import MyBets from './MyBets';
import Leaderboard from './Leaderboard';
import FightResults from './FightResults';
import ClearBets from './ClearBets';
import Maintainers from './Maintainers';
import PublicPredictions from './PublicPredictions';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bettingStatus, setBettingStatus] = useState(null);
  const [userStats, setUserStats] = useState({ total_points: 0, ranking: '-' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [publicPredictionsEventId, setPublicPredictionsEventId] = useState(null);
  const [myBetsEventId, setMyBetsEventId] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const currentYear = new Date().getFullYear();

  // Función para recargar stats del usuario
  const refreshUserStats = async () => {
    try {
      const statsResponse = await api.get('/leaderboard/user/stats');
      if (statsResponse.data.success) {
        console.log('User stats refreshed:', statsResponse.data.data);
        setUserStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error refreshing user stats:', error);
    }
  };

  // Función para cambiar contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSettingsMessage({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setSettingsMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setSettingsMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setSettingsLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });

      setSettingsMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      setSettingsMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al cambiar contraseña'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusResponse, statsResponse, eventsResponse, lastEventResponse] = await Promise.all([
          api.get('/config/betting-status'),
          api.get('/leaderboard/user/stats'),
          api.get('/bets/events'),
          api.get('/bets/last-completed-event')
        ]);

        if (statusResponse.data.success) {
          setBettingStatus(statusResponse.data.data);
        }

        if (statsResponse.data.success) {
          console.log('Initial user stats loaded:', statsResponse.data.data);
          setUserStats(statsResponse.data.data);
        }

        if (lastEventResponse.data.success && lastEventResponse.data.data) {
          setLastEvent(lastEventResponse.data.data);
        }

        // Obtener el evento actual basado en current_event_id de la configuración
        if (eventsResponse.data.success && eventsResponse.data.data.length > 0) {
          const currentEventId = statusResponse.data.data?.current_event_id;
          let selectedEvent = null;

          if (currentEventId) {
            // Buscar el evento por ID
            selectedEvent = eventsResponse.data.data.find(
              event => event.event_id === parseInt(currentEventId)
            );
          }

          // Si no se encuentra o no hay current_event_id, usar el primer evento
          if (!selectedEvent) {
            selectedEvent = eventsResponse.data.data[0];
          }

          console.log('Selected event:', selectedEvent);
          setCurrentEvent(selectedEvent);
          setSelectedEventId(selectedEvent.event_id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Recargar stats cuando el usuario vuelva a la pestaña de inicio
  useEffect(() => {
    if (activeTab === 'home') {
      refreshUserStats();
    }
  }, [activeTab]);

  // Handlers para navegación interna
  const handleNavigateToBetting = (eventId) => {
    setSelectedEventId(eventId);
    setActiveTab('betting');
  };

  const handleNavigateToMyBets = (eventId) => {
    setMyBetsEventId(eventId);
    setActiveTab('my-bets');
  };

  const handleNavigateToPublicPredictions = (eventId) => {
    setPublicPredictionsEventId(eventId);
    setActiveTab('public-predictions');
  };

  // Definir las pestañas disponibles
  const tabs = [
    { id: 'home', label: 'Inicio', icon: '🏛️', adminOnly: false, hideForAdmin: false },
    { id: 'events', label: 'Eventos', icon: '⚡', adminOnly: false, hideForAdmin: false },
    { id: 'betting', label: 'Apuestas', icon: '🥊', adminOnly: false, hideForAdmin: true },
    { id: 'my-bets', label: 'Mis Apuestas', icon: '🎟️', adminOnly: false, hideForAdmin: true },
    { id: 'leaderboard', label: 'Clasificación', icon: '🏆', adminOnly: false, hideForAdmin: false },
    { id: 'results', label: 'Resultados', icon: '🔔', adminOnly: true, hideForAdmin: false },
    { id: 'clear', label: 'Limpiar', icon: '🗑️', adminOnly: true, hideForAdmin: false },
    { id: 'maintainers', label: 'Mantenedores', icon: '⚙️', adminOnly: true, hideForAdmin: false },
  ].filter(tab => {
    if (tab.adminOnly && user?.role !== 'admin') return false;
    if (tab.hideForAdmin && user?.role === 'admin') return false;
    return true;
  });

  // Renderizar el contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Welcome Card */}
            <div className={`relative group ${user?.role === 'admin' ? 'md:col-span-3' : ''}`}>
              <div className={`absolute inset-0 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300 ${
                bettingStatus?.betting_enabled
                  ? 'bg-gradient-to-br from-green-600 via-green-700 to-black'
                  : 'bg-gradient-to-br from-slate-600 via-gray-700 to-black'
              }`}></div>
              <div className={`relative rounded-2xl shadow-2xl p-5 text-white border-2 transform hover:scale-[1.02] transition-all duration-300 overflow-hidden h-full ${
                bettingStatus?.betting_enabled
                  ? 'bg-gradient-to-br from-black via-green-900 to-black border-green-500'
                  : 'bg-gradient-to-br from-black via-slate-800 to-black border-slate-500'
              }`}>
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)',
                  }}></div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-shine ${
                  bettingStatus?.betting_enabled ? 'via-green-500/20' : 'via-slate-400/20'
                }`}></div>

                <div className="relative z-10">
                  <h1 className="text-2xl font-black text-white mb-3 animate-fade-in">
                    ¡Bienvenido, {user?.username}!
                  </h1>

                  {loading ? (
                    <p className="text-white/70 text-sm">Cargando información...</p>
                  ) : user?.role === 'admin' ? (
                    <div className={`flex flex-wrap gap-3 ${bettingStatus?.betting_enabled ? '' : ''}`}>
                      <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                        bettingStatus?.betting_enabled
                          ? 'bg-green-500/20 border-green-400/50'
                          : 'bg-slate-500/20 border-slate-400/50'
                      }`}>
                        <span className="text-xl">{bettingStatus?.betting_enabled ? '🟢' : '🔴'}</span>
                        <div>
                          <p className={`text-sm font-black leading-none mb-0.5 ${bettingStatus?.betting_enabled ? 'text-green-400' : 'text-slate-300'}`}>
                            {bettingStatus?.betting_enabled ? 'APUESTAS ABIERTAS' : 'APUESTAS CERRADAS'}
                          </p>
                          <p className="text-white/50 text-xs">
                            {bettingStatus?.betting_enabled
                              ? `Evento activo: ${currentEvent?.event_name || '—'}`
                              : 'Sin evento activo actualmente'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-lg">
                        <span className="text-xl">⚙️</span>
                        <div>
                          <p className="text-sm font-black text-white/80 leading-none mb-0.5">PANEL DE ADMINISTRACIÓN</p>
                          <p className="text-white/40 text-xs">Gestiona eventos, resultados y usuarios</p>
                        </div>
                      </div>
                    </div>
                  ) : bettingStatus?.betting_enabled ? (
                    <div>
                      <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm p-3 rounded-lg border border-green-400/50 mb-2">
                        <div className="bg-green-500 rounded-full p-2 animate-pulse">
                          <span className="text-xl">🎯</span>
                        </div>
                        <div>
                          <p className="text-lg font-black text-green-400 leading-none mb-0.5">¡APUESTAS ABIERTAS!</p>
                          <p className="text-white/80 text-xs">Es tu momento de brillar</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/70">
                        <span className="font-bold text-green-400">🥊 ¡El octágono te espera!</span>
                        <span className="block text-white/50 mt-0.5">Analiza, predice y domina el juego.</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 bg-slate-500/20 backdrop-blur-sm p-3 rounded-lg border border-slate-400/50 mb-2">
                        <div className="bg-slate-500 rounded-full p-2">
                          <span className="text-xl">⏸️</span>
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-300 leading-none mb-0.5">APUESTAS EN PAUSA</p>
                          <p className="text-white/80 text-xs">Prepárate para el próximo round</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/70">
                        <span className="font-bold text-slate-300">📊 Tiempo de análisis</span>
                        <span className="block text-white/50 mt-0.5">Estudia y perfecciona tu estrategia.</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta de Puntos Totales — solo usuarios normales */}
            {user?.role !== 'admin' && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-black rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                <div className="relative bg-gradient-to-br from-black via-red-900 to-black rounded-2xl shadow-2xl p-5 text-white border-2 border-red-500 transform hover:scale-105 transition-all duration-300 overflow-hidden h-full">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)',
                    }}></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-shine"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-red-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          Temporada {currentYear}
                        </p>
                        <p className="text-white/90 text-sm font-semibold">PUNTOS TOTALES</p>
                      </div>
                      <div className="bg-red-500/30 p-2 rounded-lg backdrop-blur-sm border border-red-400/50">
                        <span className="text-2xl">🥊</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      <p className="text-5xl font-black text-red-400 leading-none tracking-tight">
                        {parseFloat(userStats.total_points || 0).toFixed(2)}
                      </p>
                      <p className="text-white/70 text-base font-bold mb-1">pts</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-red-500/30">
                      <p className="text-xs text-white/60">Sigue apostando para escalar posiciones</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjeta de Ranking — solo usuarios normales */}
            {user?.role !== 'admin' && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-yellow-700 to-black rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                <div className="relative bg-gradient-to-br from-black via-yellow-900 to-black rounded-2xl shadow-2xl p-5 text-white border-2 border-yellow-500 transform hover:scale-105 transition-all duration-300 overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-32 h-32 opacity-10 rotate-45">
                    <div className="text-8xl">🏆</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-shine-reverse"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-yellow-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                          Clasificación {currentYear}
                        </p>
                        <p className="text-white/90 text-sm font-semibold">POSICIÓN ACTUAL</p>
                      </div>
                      <div className="bg-yellow-500/30 p-2 rounded-lg backdrop-blur-sm border border-yellow-400/50">
                        <span className="text-2xl">🏆</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-1">
                      {userStats.ranking === '-' ? (
                        <p className="text-5xl font-black text-yellow-400 leading-none">-</p>
                      ) : (
                        <>
                          <p className="text-2xl font-black text-yellow-400/70 leading-none">#</p>
                          <p className="text-5xl font-black text-yellow-400 leading-none tracking-tight">
                            {userStats.ranking}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-yellow-500/30">
                      <p className="text-xs text-white/60">
                        {userStats.ranking === '-'
                          ? 'Realiza apuestas para entrar al ranking'
                          : userStats.ranking <= 3
                            ? '¡Estás en el podio! 🔥'
                            : 'Sigue mejorando para llegar al top 3'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Último Evento */}
            {lastEvent && (
              <div className="md:col-span-3 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-800 to-black rounded-2xl transform rotate-[0.5deg] group-hover:rotate-1 transition-transform duration-300"></div>
                <div className="relative bg-gradient-to-br from-black via-indigo-950 to-black rounded-2xl shadow-2xl p-5 text-white border-2 border-indigo-500 overflow-hidden">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shine"></div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/30 p-2 rounded-lg border border-indigo-400/50">
                          <span className="text-2xl">🏟️</span>
                        </div>
                        <div>
                          <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full"></span>
                            Último Evento Finalizado
                          </p>
                          <h2 className="text-xl font-black text-white">{lastEvent.event.event_name}</h2>
                        </div>
                      </div>
                      <div className="text-right text-xs text-white/50">
                        {lastEvent.event.city && <p>{lastEvent.event.city}{lastEvent.event.state ? `, ${lastEvent.event.state}` : ''}</p>}
                        {lastEvent.event.event_date && (
                          <p className="text-indigo-300 font-semibold mt-0.5">
                            {new Date(lastEvent.event.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fights grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {lastEvent.fights.map((fight) => {
                        const isDraw = fight.result_type_code === 'draw';
                        const isNC = fight.result_type_code === 'no_contest';
                        const isMain = fight.category_code === 'main_event' || !!fight.is_main_event;
                        const isCoMain = fight.category_code === 'co_main';
                        return (
                          <div
                            key={fight.fight_id}
                            className={`rounded-xl p-3 border ${
                              isMain
                                ? 'bg-yellow-500/10 border-yellow-500/40 sm:col-span-2 lg:col-span-1'
                                : 'bg-white/5 border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {isMain && <span className="text-xs bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded">MAIN</span>}
                              {isCoMain && <span className="text-xs bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded">CO-MAIN</span>}
                              {!!fight.is_title_fight && <span className="text-xs bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">🏆 TÍTULO</span>}
                              <span className="text-xs text-white/40 ml-auto">{fight.weight_class_name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-bold truncate ${fight.winner_name === fight.red_fighter_name ? 'text-white' : 'text-white/50'}`}>
                                {fight.red_fighter_name}
                              </span>
                              <span className="text-white/30 text-xs shrink-0">vs</span>
                              <span className={`text-sm font-bold truncate text-right ${fight.winner_name === fight.blue_fighter_name ? 'text-white' : 'text-white/50'}`}>
                                {fight.blue_fighter_name}
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              {isDraw ? (
                                <span className="text-xs text-yellow-400 font-semibold">Empate</span>
                              ) : isNC ? (
                                <span className="text-xs text-gray-400 font-semibold">No Contest</span>
                              ) : (
                                <>
                                  <span className="text-xs text-green-400">✓</span>
                                  <span className="text-xs text-green-400 font-bold">{fight.winner_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'events':
        return (
          <EventsList
            onNavigateToBetting={handleNavigateToBetting}
            onNavigateToMyBets={handleNavigateToMyBets}
            onNavigateToPublicPredictions={handleNavigateToPublicPredictions}
          />
        );
      case 'betting':
        return <Betting eventId={selectedEventId} />;
      case 'my-bets':
        return <MyBets eventId={myBetsEventId} onNavigateToEvents={() => setActiveTab('events')} />;
      case 'public-predictions':
        return <PublicPredictions eventId={publicPredictionsEventId} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'results':
        return <FightResults embedded={true} />;
      case 'clear':
        return <ClearBets />;
      case 'maintainers':
        return <Maintainers />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-gradient-to-r from-black via-red-900 to-black border-b border-red-500/50 shadow-lg shadow-red-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-xl opacity-60 animate-pulse-glow"></div>
                  <img
                    src="/images/logo/logomma.png"
                    alt="MMA Logo"
                    className="relative h-12 w-auto object-contain drop-shadow-2xl animate-logo-pulse"
                    style={{
                      filter: 'drop-shadow(0 0 15px rgba(220, 38, 38, 0.8))'
                    }}
                  />
                </div>
                <span className="relative text-3xl font-bold text-white drop-shadow-lg">
                  UFC Predictions
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInstructionsModal(true)}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 border border-yellow-500/40 tracking-wide"
              >
                INSTRUCCIONES
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-white/20"
                >
                  Panel Admin
                </button>
              )}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-3 py-2 rounded-md border border-white/20 transition-all duration-200 cursor-pointer"
              >
                {/* Avatar circular con inicial */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                {/* Info del usuario */}
                <div className="text-left">
                  <p className="font-medium text-sm text-white">{user?.username}</p>
                  <p className="text-xs text-white/60">{parseFloat(userStats.total_points || 0).toFixed(2)} pts</p>
                </div>
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-red-700"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner de Estado de Apuestas */}
      <div className={`${
        bettingStatus?.betting_enabled
          ? 'bg-gradient-to-r from-green-900 via-green-700 to-green-900'
          : 'bg-gradient-to-r from-red-900 via-orange-700 to-red-900'
      } border-b border-white/20 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`${
                bettingStatus?.betting_enabled
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-red-500'
              } w-3 h-3 rounded-full`}></div>
              <div className="text-white">
                <p className="font-bold text-lg">
                  {bettingStatus?.betting_enabled ? '🟢 APUESTAS ABIERTAS' : '🔴 APUESTAS CERRADAS'}
                </p>
                {currentEvent && bettingStatus?.betting_enabled && (
                  <p className="text-sm text-white/90">
                    Evento Vigente: <span className="font-semibold">{currentEvent.event_name}</span>
                    {currentEvent.event_date && (
                      <span className="ml-2">
                        • {new Date(currentEvent.event_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </p>
                )}
                {!bettingStatus?.betting_enabled && (
                  <p className="text-sm text-white/90">
                    Espera a que se abra el próximo evento para participar
                  </p>
                )}
              </div>
            </div>
            {bettingStatus?.betting_enabled && currentEvent && user?.role !== 'admin' && (
              <button
                onClick={() => setActiveTab('betting')}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-bold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                🥊 Apostar Ahora
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu de pestañas */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-20 z-40 w-full overflow-x-auto scrollbar-none">
        <div className="flex flex-row" style={{ minWidth: 'max-content', width: '100%' }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ flex: '1 1 0', minWidth: '90px' }}
              className={`
                flex items-center justify-center px-4 py-3.5 font-semibold text-sm tracking-wide
                transition-all duration-200 relative overflow-hidden whitespace-nowrap
                ${idx < tabs.length - 1 ? 'border-r border-white/20' : ''}
                ${activeTab === tab.id
                  ? 'bg-red-700 text-white border-b-4 border-b-red-400 shadow-[inset_0_-2px_8px_rgba(255,255,255,0.1)]'
                  : 'text-white/60 hover:bg-white/10 hover:text-white border-b-4 border-b-transparent'
                }
              `}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>

      {/* Modal de Configuración */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                ⚙️ Configuración
              </h2>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setSettingsMessage({ type: '', text: '' });
                }}
                className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              {/* Profile Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Mi Perfil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Usuario
                    </label>
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <p className="font-semibold text-gray-800">{user?.username}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Rol
                    </label>
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <p className="font-semibold text-gray-800 capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Puntos Totales ({currentYear})
                    </label>
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <p className="font-semibold text-red-600">{parseFloat(userStats.total_points || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Ranking ({currentYear})
                    </label>
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <p className="font-semibold text-yellow-600">
                        {userStats.ranking === '-' ? '-' : `#${userStats.ranking}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Change Password */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Cambiar Contraseña</h3>

                {settingsMessage.text && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      settingsMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}
                  >
                    {settingsMessage.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      required
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, currentPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={passwords.confirmNewPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirmNewPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {settingsLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                  </button>
                </form>
              </div>

              {/* Info */}
              <div className="mt-6 bg-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  🔒 Seguridad
                </h4>
                <ul className="space-y-1 text-gray-600 text-xs">
                  <li>• Tu nombre de usuario es único y no puede modificarse</li>
                  <li>• Usa una contraseña segura con al menos 6 caracteres</li>
                  <li>• No compartas tus credenciales con nadie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setShowInstructionsModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-red-500/40"
            style={{ backgroundColor: '#0a0a0a' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* UFC logo as transparent background */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                backgroundImage: 'url(/images/logo/ufclogo.jpeg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: 0.06,
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                  Instrucciones
                </h2>
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="text-white/50 hover:text-white text-2xl leading-none transition-colors"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-5 text-white/85 text-sm leading-relaxed">
                <section>
                  <h3 className="text-red-400 font-bold text-base uppercase tracking-wide mb-2">MMA METAL AND GORE BETS</h3>
                  <p>
                    Bienvenido al sistema de predicciones UFC, para MMA Metal and Gore, un sistema de entretenimiento para fanáticos de las MMA.
                    Sin dinero real, todo es competitivo entre la comunidad y demostrar quien sabe más.
                    El objetivo es demostrar quién es el más conocedor, para predecir los resultados de cada pelea.
                  </p>
                </section>

                <section>
                  <h3 className="text-red-400 font-bold text-base uppercase tracking-wide mb-2">¿Cómo funciona cada apuesta?</h3>
                  <p>
                    Por cada pelea del evento activo recibes <strong className="text-yellow-400">100 dólares virtuales</strong> para apostar.
                    Si aciertas al ganador, tus puntos se multiplican por la cuota (odd) asignada a ese peleador.
                    Si fallas, pierdes los puntos que apostaste. Una de las claves es si apuestas a un underdog y aciertas, tu cuota será mayor.
                  </p>
                </section>

                <section>
                  <h3 className="text-red-400 font-bold text-base uppercase tracking-wide mb-2">¿Cuándo puedo apostar?</h3>
                  <p>
                    Las apuestas se abren cuando el próximo evento está previo a comenzar, y se cierran antes del inicio
                    del primer combate en la lista de apuestas. El banner en la parte superior de la pantalla te indica si las apuestas
                    están <strong className="text-green-400">abiertas</strong> o <strong className="text-red-400">cerradas</strong>.
                    Una vez cerradas, no puedes modificar ni agregar predicciones. Además, al realizar las apuestas de un evento, estas no pueden ser modificadas, aunque
                    las apuestas sigan habilitadas, por lo cual es bueno confirmar antes de hacer las apuestas del evento respectivo.
                  </p>
                </section>

                <section>
                  <h3 className="text-red-400 font-bold text-base uppercase tracking-wide mb-2">¿Qué gana el ganador de cada evento?</h3>
                  <p>
                    El usuario con más puntos al finalizar el evento puede publicar un mensaje especial
                    que quedará visible para todos en la sección <strong className="text-yellow-400">Clasificación</strong>.
                    Es tu momento de gloria — úsalo con sabiduría (o con provocación). El criterio es en base a dos filtros:
                    Puntos, y en caso de empate, el usuario que se haya creado antes tendrá prioridad.
                  </p>
                </section>

                <section>
                  <h3 className="text-red-400 font-bold text-base uppercase tracking-wide mb-2">Acceso al sistema</h3>
                  <p>
                    El registro no es público. Para participar necesitas un enlace de invitación único.
                    Las sesiones están protegidas con JWT — si cierras sesión necesitarás tu contraseña para volver a ingresar.
                    Puedes cambiar tu contraseña en cualquier momento desde el ícono de usuario (arriba a la derecha).
                  </p>
                </section>

                <section>
                  <h3 className="text-red-400 font-bold text-base uppercase tracking-wide mb-2">Secciones disponibles</h3>
                  <ul className="space-y-1 pl-4">
                    <li><span className="text-yellow-400 font-semibold">Inicio</span> — Resumen de tu posición y estado del evento activo.</li>
                    <li><span className="text-yellow-400 font-semibold">Eventos</span> — Listado de todos los eventos con sus peleas.</li>
                    <li><span className="text-yellow-400 font-semibold">Apuestas</span> — Realiza tus predicciones para el evento activo.</li>
                    <li><span className="text-yellow-400 font-semibold">Mis Apuestas</span> — Historial de todas tus predicciones.</li>
                    <li><span className="text-yellow-400 font-semibold">Clasificación</span> — Ranking general por evento y por año.</li>
                  </ul>
                </section>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-lg font-bold transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
