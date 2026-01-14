import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import FightCard from '../components/FightCard';

const Betting = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bettingStatus, setBettingStatus] = useState({ betting_enabled: false, fights: [] });
  const [tempBets, setTempBets] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadFights();
  }, []);

  const loadFights = async () => {
    try {
      const res = await api.get('/bets/available');
      setBettingStatus(res.data.data);
    } catch (error) {
      console.error('Error loading fights:', error);
      setMessage({ type: 'error', text: 'Error al cargar las peleas' });
    } finally {
      setLoading(false);
    }
  };

  const handleBetChange = (fightId, betData) => {
    setTempBets(prev => ({
      ...prev,
      [fightId]: betData
    }));
    setHasChanges(true);
  };

  const handleSubmitAll = async () => {
    if (Object.keys(tempBets).length === 0) {
      setMessage({ type: 'error', text: 'No hay apuestas para enviar' });
      return;
    }

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
      setTimeout(() => {
        navigate('/my-bets');
      }, 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-white">\ud83c\udfaf Apuestas UFC</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
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

        {!bettingStatus.betting_enabled ? (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">Apuestas cerradas</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">---</h2>
            <p className="text-gray-600 mb-6">Las apuestas no están disponibles en este momento.</p>
            <button
              onClick={() => navigate('/my-bets')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Ver Mis Apuestas
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/30">
              <h2 className="text-2xl font-bold text-white mb-2">\u2713 Apuestas Abiertas</h2>
              <p className="text-white/90">Selecciona tus apuestas y envíalas todas al final</p>
            </div>

            {bettingStatus.fights.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-600">No hay peleas disponibles para apostar en este momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bettingStatus.fights.map((fight) => (
                  <FightCard
                    key={fight.fight_id}
                    fight={fight}
                    onBetChange={handleBetChange}
                    currentBet={tempBets[fight.fight_id]}
                  />
                ))}
              </div>
            )}

            {hasChanges && (
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
                      onClick={handleSubmitAll}
                      disabled={submitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Todas las Apuestas'}
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
