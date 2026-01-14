import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
                <p className="text-sm text-white/70">{user?.total_points || 0} puntos</p>
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
          <p className="text-gray-600 mb-6">
            Estás conectado exitosamente al sistema de pronósticos UFC.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/betting')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              🎲 Realizar Apuestas
            </button>
            <button
              onClick={() => navigate('/my-bets')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              📋 Mis Apuestas
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/maintainers')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                ⚙️ Mantenedores
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Puntos Totales</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {user?.total_points || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-3xl">🏆</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pronósticos</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">0</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ranking</p>
                <p className="text-3xl font-bold text-green-600 mt-1">-</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-3xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Información del Perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Usuario
              </label>
              <p className="text-lg font-semibold text-gray-800">{user?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                País
              </label>
              <p className="text-lg font-semibold text-gray-800">
                {user?.country_name || 'No especificado'} {user?.country_code && `(${user.country_code})`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Miembro desde
              </label>
              <p className="text-lg font-semibold text-gray-800">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
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
      </div>
    </div>
  );
};

export default Dashboard;
