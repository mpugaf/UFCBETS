import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import FightCard from '../components/FightCard';

const Betting = () => {
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
        const eventId = searchParams.get('event_id');
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
  }, [searchParams]);

  const loadFights = async () => {
    try {
      const eventId = searchParams.get('event_id');
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
    <div className="min-h-screen">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">🎯 Apuestas UFC</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/events')} className="text-white hover:text-white/80 font-medium">Eventos</button>
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
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        )}

        {!hasCategories ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">⏸️</div>
            {bettingStatus.event ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{bettingStatus.event.event_name}</h2>
                <p className="text-gray-600 mb-6">
                  {bettingStatus.betting_enabled
                    ? 'No hay peleas disponibles para este evento en este momento.'
                    : 'Las apuestas están cerradas para este evento.'}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Sin Peleas Disponibles</h2>
                <p className="text-gray-600 mb-6">No hay eventos disponibles para apostar en este momento.</p>
              </>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/events')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
              >
                Ver Eventos
              </button>
              <button
                onClick={() => navigate('/my-bets')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Mis Apuestas
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={`backdrop-blur-lg rounded-xl p-6 mb-6 border ${
              bettingStatus.betting_enabled
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-white/30'
                : 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-white/20'
            }`}>
              <h2 className="text-2xl font-bold text-white mb-2">
                {bettingStatus.betting_enabled ? '✓ Apuestas Abiertas' : '👁️ Ver Peleas'}
              </h2>
              {bettingStatus.event && (
                <p className="text-white/90">{bettingStatus.event.event_name} - {new Date(bettingStatus.event.event_date).toLocaleDateString('es-ES')}</p>
              )}
              <p className="text-white/80 text-sm mt-1">
                {bettingStatus.betting_enabled
                  ? 'Selecciona tus apuestas y envíalas todas al final'
                  : 'Las apuestas están cerradas para este evento'}
              </p>
            </div>

            <div className="space-y-8">
              {bettingStatus.categories.map((category) => (
                <div key={category.category_code} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">
                      {category.category_code === 'title_fight' ? '🏆' :
                       category.category_code === 'main_card' ? '⭐' : '🥊'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{category.category_name}</h3>
                      <p className="text-white/60 text-sm">{category.fights.length} pelea{category.fights.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Fights in this category */}
                  <div className="space-y-4 pl-4">
                    {category.fights.map((fight) => {
                      const existingBet = existingBetsByFight[fight.fight_id];
                      const isLocked = !!existingBet;

                      return (
                        <FightCard
                          key={fight.fight_id}
                          fight={fight}
                          onBetChange={handleBetChange}
                          currentBet={tempBets[fight.fight_id]}
                          existingBet={existingBet}
                          disabled={!bettingStatus.betting_enabled || isLocked}
                          isLocked={isLocked}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {hasChanges && bettingStatus.betting_enabled && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {getTotalBets()} apuesta{getTotalBets() !== 1 ? 's' : ''} lista{getTotalBets() !== 1 ? 's' : ''} para enviar
                    </p>
                    <p className="text-sm text-gray-600">
                      Total apostado: {getTotalBets() * 100} puntos
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setTempBets({});
                        setHasChanges(false);
                      }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitClick}
                      disabled={submitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Apuestas'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      ¿Confirmar Apuestas?
                    </h2>
                    <p className="text-gray-600">
                      Estás a punto de enviar <strong>{getTotalBets()} apuesta{getTotalBets() !== 1 ? 's' : ''}</strong>.
                    </p>
                    <p className="text-red-600 font-semibold mt-3">
                      ⚠️ No podrás modificarlas después de confirmar
                    </p>
                    {getTotalBets() < getTotalFights() && (
                      <p className="text-orange-600 text-sm mt-2">
                        Nota: Estás dejando {getTotalFights() - getTotalBets()} pelea{getTotalFights() - getTotalBets() !== 1 ? 's' : ''} sin apostar. Podrás apostar en ellas más tarde.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleConfirmSubmit}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700"
                    >
                      Sí, Confirmar Apuestas
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                    >
                      Cancelar y Revisar
                    </button>
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
