import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyBets = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, won: 0, lost: 0 });

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    try {
      const res = await api.get('/bets/my-bets');
      const betsData = res.data.data;
      setBets(betsData);

      const stats = {
        total: betsData.length,
        pending: betsData.filter(b => b.status === 'pending').length,
        won: betsData.filter(b => b.status === 'won').length,
        lost: betsData.filter(b => b.status === 'lost').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading bets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
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
              <button onClick={() => navigate('/betting')} className="text-white hover:text-white/80 font-medium">Apuestas</button>
              <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium">Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/95 rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-sm">Total Apuestas</p>
            <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
          </div>
          <div className="bg-white/95 rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-sm">Pendientes</p>
            <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
          </div>
          <div className="bg-white/95 rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-sm">Ganadas</p>
            <p className="text-3xl font-bold text-green-600">{stats.won}</p>
          </div>
          <div className="bg-white/95 rounded-xl shadow-lg p-4">
            <p className="text-gray-600 text-sm">Perdidas</p>
            <p className="text-3xl font-bold text-red-600">{stats.lost}</p>
          </div>
        </div>

        {/* Bets List */}
        {bets.length === 0 ? (
          <div className="bg-white/95 rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No tienes apuestas</h2>
            <p className="text-gray-600 mb-6">Comienza a realizar tus pronósticos</p>
            <button
              onClick={() => navigate('/betting')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Ir a Apuestas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <div key={bet.bet_id} className="bg-white/95 rounded-xl shadow-lg overflow-hidden">
                <div className={`p-4 ${
                  bet.status === 'pending' ? 'bg-blue-500' :
                  bet.status === 'won' ? 'bg-green-500' :
                  bet.status === 'lost' ? 'bg-red-500' : 'bg-gray-500'
                } text-white`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{bet.event_name}</h3>
                      <p className="text-sm opacity-90">{new Date(bet.event_date).toLocaleDateString('es-ES')} | {bet.weight_class_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                        {bet.status === 'pending' ? '⏳ Pendiente' :
                         bet.status === 'won' ? '✓ Ganada' :
                         bet.status === 'lost' ? '✗ Perdida' : bet.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Pelea</p>
                    <p className="font-semibold text-gray-800">{bet.red_fighter_name} vs {bet.blue_fighter_name}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Tu Pronóstico</p>
                      <p className={`font-bold ${
                        bet.predicted_winner_id === bet.red_fighter_id ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {bet.predicted_winner_id === bet.red_fighter_id ? '🔴' : '🔵'} {bet.predicted_winner_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cuota</p>
                      <p className="font-bold text-purple-600">{bet.odds_value}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ganancia Potencial</p>
                      <p className="font-bold text-green-600">${bet.potential_return}</p>
                    </div>
                  </div>

                  {bet.actual_winner_name && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600">Ganador Real</p>
                      <p className="font-bold text-gray-800">{bet.actual_winner_name}</p>
                    </div>
                  )}
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
