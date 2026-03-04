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
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const registrationToken = searchParams.get('token');

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    nickname: ''
  });

  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (registrationToken) {
      validateToken();
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
    setLoginError(''); // Limpiar error anterior

    try {
      const result = await login(loginData);
      console.log('Login result:', result); // Debug
      if (!result.success) {
        console.log('Login failed, showing error'); // Debug
        setLoginError('No se puede iniciar sesión');
        setLoading(false);
        return; // Important: stop here on error
      }
      // Si llegamos aquí, el login fue exitoso y PublicRoute redirigirá automáticamente
    } catch (err) {
      console.log('Login exception:', err); // Debug
      setLoginError('No se puede iniciar sesión');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...registerData,
        token: registrationToken
      };
      console.log('Datos a enviar:', dataToSend);

      const result = await register(dataToSend);
      console.log('Resultado del registro:', result);

      if (result.success) {
        navigate('/dashboard');
      } else {
        console.error('Error en registro:', result);
        alert(result.message || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error al registrar usuario');
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Efectos de partículas decorativas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-purple-500 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-1/3 w-3 h-3 bg-pink-500 rounded-full animate-float-delayed opacity-50"></div>
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-indigo-500 rounded-full animate-float opacity-70"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float-logo opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/2 w-3 h-3 bg-pink-400 rounded-full animate-pulse-slow opacity-50"></div>
      </div>

      {/* Imagen izquierda con efectos */}
      <div className="absolute left-4 lg:left-12 xl:left-20 top-1/2 -translate-y-1/2 w-72 h-96 hidden lg:block">
        <div className="relative w-full h-full animate-float">
          <img
            src="/images/backgrounds/danabet.png"
            alt="Fighter Left"
            className="w-full h-full object-contain rounded-3xl shadow-2xl animate-pulse-slow opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(147, 51, 234, 0.7)) brightness(1.1) contrast(1.2)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-shine rounded-3xl"></div>
        </div>
      </div>

      {/* Imagen derecha con efectos */}
      <div className="absolute right-4 lg:right-12 xl:right-20 top-1/2 -translate-y-1/2 w-72 h-96 hidden lg:block">
        <div className="relative w-full h-full animate-float-delayed">
          <img
            src="/images/backgrounds/khabib.png"
            alt="Fighter Right"
            className="w-full h-full object-contain rounded-3xl shadow-2xl animate-pulse-slow opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-105"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(147, 51, 234, 0.7)) brightness(1.1) contrast(1.2)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-500/20 to-transparent animate-shine-reverse rounded-3xl"></div>
        </div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          {/* Logo con efectos espectaculares */}
          <div className="relative inline-block mb-6 animate-float-logo">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-lg blur-2xl opacity-75 animate-pulse-glow"></div>
            <div className="absolute inset-0 animate-rotate-slow">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 rounded-lg blur-xl opacity-50"></div>
            </div>
            <img
              src="/images/logo/mmglogo.jpeg"
              alt="UFC Logo"
              className="relative mx-auto h-32 w-auto object-contain rounded-lg shadow-2xl animate-logo-pulse hover:scale-110 transition-transform duration-300"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8)) brightness(1.2)'
              }}
            />
          </div>

          <h1 className="text-5xl font-bold text-white mb-2 animate-gradient bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            MMA BETS
          </h1>
          <h2 className="text-3xl font-bold text-white animate-gradient bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Predictions
          </h2>
          <p className="text-white font-semibold mt-3 text-lg tracking-widest uppercase animate-fade-in bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            {registrationToken ? 'Tu lugar en el octágono te espera' : 'Predice · Compite · Domina'}
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Efecto de brillo en el formulario */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 animate-gradient pointer-events-none"></div>
          <div className="relative z-10">
          {!registrationToken ? (
            <>
              {/* Mensaje de error */}
              {loginError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-xl">⚠️</span>
                    <p className="text-red-700 font-semibold">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) => {
                      setLoginData({ ...loginData, username: e.target.value });
                      if (loginError) setLoginError(''); // Limpiar error al escribir
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 hover:border-purple-400 focus:scale-105 hover:shadow-lg"
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
                    onChange={(e) => {
                      setLoginData({ ...loginData, password: e.target.value });
                      if (loginError) setLoginError(''); // Limpiar error al escribir
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 hover:border-purple-400 focus:scale-105 hover:shadow-lg"
                    placeholder="Contraseña"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10">{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Crear Cuenta
              </h3>

              {!registrationToken ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">Crear Cuenta</div>
                  <p className="text-gray-600 mb-2">El registro requiere un link de invitación</p>
                  <p className="text-sm text-gray-500">Contacta al administrador para obtener acceso</p>
                </div>
              ) : !tokenValid ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">❌</div>
                  <p className="text-red-600 font-semibold mb-2">Token Inválido</p>
                  <p className="text-sm text-gray-600">{tokenError}</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 hover:border-purple-400 focus:scale-105 hover:shadow-lg"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 hover:border-purple-400 focus:scale-105 hover:shadow-lg"
                      placeholder="Cómo quieres que te llamen"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 hover:border-purple-400 focus:scale-105 hover:shadow-lg"
                      placeholder="Contraseña"
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className="relative z-10">{loading ? 'Creando cuenta...' : 'Registrarme'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>
              )}
            </>
          )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
