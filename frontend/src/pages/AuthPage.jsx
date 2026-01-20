import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const registrationToken = searchParams.get('token');

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    nickname: ''
  });

  useEffect(() => {
    if (registrationToken) {
      validateToken();
      setActiveTab('register');
    } else {
      setTokenValidating(false);
    }
  }, [registrationToken]);

  const validateToken = async () => {
    try {
      const response = await api.get(`/registration-tokens/validate/${registrationToken}`);
      if (response.data.valid) {
        setTokenValid(true);
        setTokenError('');
      } else {
        setTokenValid(false);
        setTokenError(response.data.message || 'Token inválido');
      }
    } catch (error) {
      setTokenValid(false);
      setTokenError(error.response?.data?.message || 'Token inválido o expirado');
    } finally {
      setTokenValidating(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(loginData);
      if (!result.success) {
        navigate('/login-error', { state: { message: result.message } });
      }
    } catch (err) {
      navigate('/login-error', { state: { message: 'Error al conectar con el servidor' } });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await register({
        ...registerData,
        token: registrationToken
      });
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.message || 'Error al registrar usuario');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (registrationToken && tokenValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Validando token...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/images/logo/mmglogo.jpeg"
            alt="UFC Logo"
            className="mx-auto mb-6 h-32 w-auto object-contain rounded-lg shadow-lg"
          />
          <h1 className="text-5xl font-bold text-white mb-2">MMA BETS</h1>
          <h2 className="text-3xl font-bold text-white">Predictions</h2>
          <p className="text-white/80 mt-2">
            {registrationToken ? 'Completa tu registro' : 'Inicia sesión para continuar'}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          {!registrationToken && (
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Registro
              </button>
            </div>
          )}

          {activeTab === 'login' ? (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Iniciar Sesión
              </h3>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="Contraseña"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                ---
              </h3>

              {!registrationToken ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">Crear Cuenta</div>
                  <p className="text-gray-600 mb-2">El registro requiere un link de invitación</p>
                  <p className="text-sm text-gray-500">Contacta al administrador para obtener acceso</p>
                </div>
              ) : !tokenValid ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">\u274c</div>
                  <p className="text-red-600 font-semibold mb-2">Token Inválido</p>
                  <p className="text-sm text-gray-600">{tokenError}</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700 text-center">
                      \u2713 Token válido - Puedes crear tu cuenta
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuario
                    </label>
                    <input
                      type="text"
                      required
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      placeholder="usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apodo (opcional)
                    </label>
                    <input
                      type="text"
                      value={registerData.nickname}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, nickname: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      placeholder="Cómo quieres que te llamen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creando cuenta...' : '---'}
                  </button>
                </form>
              )}
            </>
          )}

          {!registrationToken && (
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>---</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
