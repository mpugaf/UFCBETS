import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bettingStatus, setBettingStatus] = useState(null);
  const [userStats, setUserStats] = useState({ total_points: 0, ranking: '-' });
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusResponse, statsResponse] = await Promise.all([
          api.get('/config/betting-status'),
          api.get('/leaderboard/user/stats')
        ]);

        if (statusResponse.data.success) {
          setBettingStatus(statusResponse.data.data);
        }

        if (statsResponse.data.success) {
          setUserStats(statsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">🥊 UFC Predictions</span>
            </div>
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  👤 Panel Admin
                </button>
              )}
              <button
                onClick={() => navigate('/settings')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                ⚙️ Configuración
              </button>
              <div className="text-white text-right">
                <p className="font-semibold">{user?.username}</p>
                <p className="text-sm text-white/70">{userStats.total_points} puntos</p>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Bienvenido, {user?.username}! 👋
          </h1>
          {loading ? (
            <p className="text-gray-600 mb-6">Cargando información...</p>
          ) : (
            <p className="text-gray-600 mb-6">
              {bettingStatus?.betting_enabled ? (
                <>
                  🎲 <span className="font-semibold text-green-600">Las apuestas están abiertas!</span>
                  {' '}Dirígete a la sección de apuestas para participar en el próximo evento.
                </>
              ) : (
                <>
                  🔒 <span className="font-semibold text-orange-600">Las apuestas están cerradas.</span>
                  {' '}Espera a que se abra el próximo evento para participar.
                </>
              )}
            </p>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/events')}
              className="bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black border-2 border-red-600 hover:border-red-500 text-white p-6 rounded-xl font-bold text-lg shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-800/50 transition-all"
            >
              📅 Ver Eventos
            </button>
            <button
              onClick={() => navigate('/betting')}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-2 border-black text-white p-6 rounded-xl font-bold text-lg shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-black/70 transition-all"
            >
              🎲 Realizar Apuestas para evento actual
            </button>
            <button
              onClick={() => navigate('/my-bets')}
              className="bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black border-2 border-red-600 hover:border-red-500 text-white p-6 rounded-xl font-bold text-lg shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-800/50 transition-all"
            >
              📋 Mis Apuestas
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-2 border-black text-white p-6 rounded-xl font-bold text-lg shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-black/70 transition-all"
            >
              🏆 Clasificación
            </button>
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/fight-results')}
                  className="bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black border-2 border-red-600 hover:border-red-500 text-white p-6 rounded-xl font-bold text-lg shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-800/50 transition-all"
                >
                  📝 Ingresar Resultados
                </button>
                <button
                  onClick={() => navigate('/clear-bets')}
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border-2 border-black text-white p-6 rounded-xl font-bold text-lg shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-black/70 transition-all"
                >
                  🧹 Limpiar Resultados
                </button>
                <button
                  onClick={() => navigate('/maintainers')}
                  className="bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black border-2 border-red-600 hover:border-red-500 text-white p-6 rounded-xl font-bold text-lg shadow-lg shadow-red-900/50 hover:shadow-xl hover:shadow-red-800/50 transition-all"
                >
                  ⚙️ Mantenedores
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Puntos Totales ({currentYear})</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {userStats.total_points}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <span className="text-3xl">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ranking ({currentYear})</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {userStats.ranking === '-' ? '-' : `#${userStats.ranking}`}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <span className="text-3xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon - Admin Only */}
        {user?.role === 'admin' && (
          <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/30">
            <h3 className="text-2xl font-bold text-white mb-4">🚀 Próximamente</h3>
            <ul className="space-y-2 text-white/90">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Sistema de pronósticos para peleas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Tabla de clasificación global
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Estadísticas detalladas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Sistema de apuestas ficticias
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
