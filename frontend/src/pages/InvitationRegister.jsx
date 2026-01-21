import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const InvitationRegister = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setValidatingToken(true);
      const res = await api.get(`/invitations/validate/${token}`);

      if (res.data.success) {
        setTokenValid(true);
        setTokenData(res.data.data);
        setMessage({
          type: 'success',
          text: 'Token válido. Puedes crear tu cuenta.'
        });
      }
    } catch (error) {
      setTokenValid(false);
      const reason = error.response?.data?.reason;
      let errorMessage = 'Token de invitación no válido';

      if (reason === 'already_used') {
        errorMessage = 'Este token ya fue utilizado';
      } else if (reason === 'expired') {
        errorMessage = 'Este token ha expirado';
      } else if (reason === 'revoked') {
        errorMessage = 'Este token fue revocado';
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setValidatingToken(false);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validaciones
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Por favor completa todos los campos obligatorios'
      });
      return;
    }

    if (formData.username.length < 3) {
      setMessage({
        type: 'error',
        text: 'El nombre de usuario debe tener al menos 3 caracteres'
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setMessage({
        type: 'error',
        text: 'El nombre de usuario solo puede contener letras, números y guiones bajos'
      });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/register-invitation', {
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname || null,
        invitationToken: token
      });

      setMessage({
        type: 'success',
        text: '¡Cuenta creada exitosamente! Redirigiendo a inicio de sesión...'
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al crear la cuenta'
      });
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Validando token de invitación...</div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Token No Válido</h1>
            <p className="text-gray-600 mb-6">{message.text}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Ir a Inicio de Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">✨ Crear Cuenta</h1>
          <p className="text-gray-600">Has sido invitado a unirte a la plataforma de apuestas UFC</p>
          <p className="text-sm text-gray-500 mt-2">Este link solo se puede usar una vez</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="tu_usuario"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo letras, números y guiones bajos (mínimo 3 caracteres)
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Apodo (opcional)
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Tu Apodo"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="••••••••"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationRegister;
