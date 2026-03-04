import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import FightCard from '../components/FightCard';

const Betting = ({ eventId: propEventId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bettingStatus, setBettingStatus] = useState({
    betting_enabled: false,
    event: null,
    categories: [],
    existing_bets: []
  });
  const [tempBets, setTempBets] = useState({});
  const [existingBetsByFight, setExistingBetsByFight] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Usar eventId del prop si está disponible, sino del searchParam
        const eventId = propEventId || searchParams.get('event_id');
        const url = eventId ? `/bets/available?event_id=${eventId}` : '/bets/available';
        const res = await api.get(url);

        if (isMounted && res.data && res.data.data) {
          setBettingStatus(res.data.data);

          // Crear un mapa de apuestas existentes por fight_id
          const existingBetsMap = {};
          if (res.data.data.existing_bets) {
            res.data.data.existing_bets.forEach(bet => {
              existingBetsMap[bet.fight_id] = bet;
            });
          }
          setExistingBetsByFight(existingBetsMap);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading fights:', error);
          setMessage({ type: 'error', text: 'Error al cargar las peleas' });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [searchParams, propEventId]);

  const loadFights = async () => {
    try {
      // Usar eventId del prop si está disponible, sino del searchParam
      const eventId = propEventId || searchParams.get('event_id');
      const url = eventId ? `/bets/available?event_id=${eventId}` : '/bets/available';
      const res = await api.get(url);

      if (res.data && res.data.data) {
        setBettingStatus(res.data.data);

        // Crear un mapa de apuestas existentes por fight_id
        const existingBetsMap = {};
        if (res.data.data.existing_bets) {
          res.data.data.existing_bets.forEach(bet => {
            existingBetsMap[bet.fight_id] = bet;
          });
        }
        setExistingBetsByFight(existingBetsMap);
      }
    } catch (error) {
      console.error('Error loading fights:', error);
      setMessage({ type: 'error', text: 'Error al cargar las peleas' });
    } finally {
      setLoading(false);
    }
  };

  const handleBetChange = (fightId, betData) => {
    // No permitir cambios para usuarios admin
    if (user?.role === 'admin') {
      return;
    }

    // No permitir cambios si ya existe una apuesta para esta pelea
    if (existingBetsByFight[fightId]) {
      setMessage({ type: 'error', text: 'Esta pelea ya tiene una apuesta registrada. No puedes modificarla.' });
      return;
    }

    setTempBets(prev => ({
      ...prev,
      [fightId]: betData
    }));
    setHasChanges(true);
  };

  const handleSubmitClick = () => {
    if (Object.keys(tempBets).length === 0) {
      setMessage({ type: 'error', text: 'No hay apuestas para enviar' });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);

    const betsArray = Object.entries(tempBets).map(([fight_id, betData]) => ({
      fight_id: parseInt(fight_id),
      ...betData
    }));

    setSubmitting(true);
    try {
      const res = await api.post('/bets/submit-all', { bets: betsArray });
      setMessage({ type: 'success', text: `¡${res.data.message}!` });
      setTempBets({});
      setHasChanges(false);

      // Recargar para obtener las apuestas actualizadas
      await loadFights();

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al procesar las apuestas'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalBets = () => {
    return Object.keys(tempBets).length;
  };

  const getTotalFights = () => {
    return bettingStatus.categories.reduce((sum, cat) => sum + cat.fights.length, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  const hasCategories = bettingStatus.categories && Array.isArray(bettingStatus.categories) && bettingStatus.categories.length > 0;

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        )}

        {!hasCategories ? (
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-2 border-slate-600 rounded-2xl p-16 text-center">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">⏸️</div>
                {bettingStatus.event ? (
                  <>
                    <h2 className="text-3xl font-black text-white mb-3">{bettingStatus.event.event_name}</h2>
                    <p className="text-white/50 mb-6">
                      {bettingStatus.betting_enabled
                        ? 'No hay peleas disponibles para este evento en este momento.'
                        : 'Las apuestas están cerradas para este evento.'}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-black text-white mb-3">Sin Peleas Disponibles</h2>
                    <p className="text-white/50 mb-6">No hay eventos disponibles para apostar en este momento.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-8 overflow-hidden rounded-2xl">
              {/* Glow layer */}
              <div className={`absolute inset-0 rounded-2xl ${
                bettingStatus.betting_enabled
                  ? 'bg-gradient-to-br from-green-600 via-emerald-800 to-black'
                  : 'bg-gradient-to-br from-slate-700 via-slate-800 to-black'
              } transform rotate-[0.5deg]`}></div>

              <div className={`relative rounded-2xl border-2 p-6 overflow-hidden ${
                bettingStatus.betting_enabled
                  ? 'bg-gradient-to-br from-black via-green-950 to-black border-green-500'
                  : 'bg-gradient-to-br from-black via-slate-900 to-black border-slate-600'
              }`}>
                {/* Diagonal pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)'
                }}></div>
                {/* Shine */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-shine ${
                  bettingStatus.betting_enabled ? 'via-green-400/10' : 'via-slate-400/10'
                }`}></div>

                <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {bettingStatus.betting_enabled
                        ? <span className="px-2 py-0.5 rounded-full text-xs font-black bg-green-500 text-white animate-pulse">⚡ APUESTAS ABIERTAS</span>
                        : user?.role === 'admin'
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-600 text-white">SOLO LECTURA</span>
                          : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-600 text-white/80">CERRADAS</span>
                      }
                    </div>
                    {bettingStatus.event && (
                      <>
                        <h2 className="text-3xl font-black text-white leading-tight">
                          {bettingStatus.event.event_name}
                        </h2>
                        <p className={`text-sm font-semibold mt-1 ${bettingStatus.betting_enabled ? 'text-green-300' : 'text-white/50'}`}>
                          📅 {new Date(bettingStatus.event.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {bettingStatus.event.city && <span className="ml-3 text-white/40">📍 {bettingStatus.event.city}</span>}
                        </p>
                      </>
                    )}
                  </div>
                  <div className={`text-right text-sm ${bettingStatus.betting_enabled ? 'text-green-400' : 'text-white/40'}`}>
                    {user?.role === 'admin'
                      ? 'Los administradores no pueden apostar'
                      : bettingStatus.betting_enabled
                        ? 'Selecciona y envía tus apuestas al final'
                        : 'Las apuestas están cerradas'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {bettingStatus.categories.map((category) => (
                <div key={category.category_code} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">
                      {category.category_code === 'title_fight' ? '🏆' :
                       category.category_code === 'main_card' ? '⭐' : '🥊'}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-wide">{category.category_name}</h3>
                      <p className="text-white/40 text-xs uppercase tracking-wider">{category.fights.length} pelea{category.fights.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Fights in this category */}
                  <div className="space-y-4 pl-4">
                    {category.fights.map((fight) => {
                      const existingBet = existingBetsByFight[fight.fight_id];
                      const isLocked = !!existingBet;
                      const isAdmin = user?.role === 'admin';

                      return (
                        <FightCard
                          key={fight.fight_id}
                          fight={fight}
                          onBetChange={handleBetChange}
                          currentBet={tempBets[fight.fight_id]}
                          existingBet={existingBet}
                          disabled={isAdmin || !bettingStatus.betting_enabled || isLocked}
                          isLocked={isLocked}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {hasChanges && bettingStatus.betting_enabled && user?.role !== 'admin' && (
              <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-black via-gray-900 to-black border-t border-green-500/40 shadow-2xl shadow-black/80 p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <div>
                    <p className="text-base font-black text-white">
                      {getTotalBets()} apuesta{getTotalBets() !== 1 ? 's' : ''} lista{getTotalBets() !== 1 ? 's' : ''} para enviar
                    </p>
                    <p className="text-sm text-white/50">
                      Total apostado: {getTotalBets() * 100} puntos
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setTempBets({});
                        setHasChanges(false);
                      }}
                      className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-bold text-sm transition-all"
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitClick}
                      disabled={submitting}
                      className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-black text-sm hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 shadow-lg shadow-green-900/50 transition-all"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Apuestas'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="relative overflow-hidden rounded-2xl max-w-md w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-900 to-black rounded-2xl transform rotate-[0.5deg]"></div>
                  <div className="relative bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 border-2 border-green-600 rounded-2xl p-6 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shine"></div>
                    <div className="relative z-10">
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-3">⚡</div>
                        <h2 className="text-2xl font-black text-white mb-2">¿Confirmar Apuestas?</h2>
                        <p className="text-white/60 text-sm">
                          Estás a punto de enviar <span className="text-white font-black">{getTotalBets()} apuesta{getTotalBets() !== 1 ? 's' : ''}</span>.
                        </p>
                        <p className="text-red-400 font-bold text-sm mt-3">
                          ⚠️ No podrás modificarlas después de confirmar
                        </p>
                        {getTotalBets() < getTotalFights() && (
                          <p className="text-yellow-400/80 text-xs mt-2">
                            Dejas {getTotalFights() - getTotalBets()} pelea{getTotalFights() - getTotalBets() !== 1 ? 's' : ''} sin apostar. Podrás añadirlas más tarde.
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={handleConfirmSubmit}
                          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-black hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-900/50 transition-all"
                        >
                          Sí, Confirmar Apuestas
                        </button>
                        <button
                          onClick={() => setShowConfirmModal(false)}
                          className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-bold transition-all"
                        >
                          Cancelar y Revisar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Betting;
