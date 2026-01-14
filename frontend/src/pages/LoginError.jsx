import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const LoginError = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || 'Credenciales incorrectas';

  useEffect(() => {
    if (!location.state?.message) {
      navigate('/');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🥊 UFC</h1>
          <h2 className="text-3xl font-bold text-white">Predictions</h2>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <svg
                className="w-16 h-16 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Error de Autenticación
          </h3>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{message}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p className="flex items-start">
              <span className="mr-2">•</span>
              Verifica que tu email y contraseña sean correctos
            </p>
            <p className="flex items-start">
              <span className="mr-2">•</span>
              Asegúrate de que tu cuenta esté activa
            </p>
            <p className="flex items-start">
              <span className="mr-2">•</span>
              Si no tienes una cuenta, contacta al administrador
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Volver al Login
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda? Contacta al administrador del sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginError;
