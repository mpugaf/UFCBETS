import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ClearBets = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmingEvent, setConfirmingEvent] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    try {
      const res = await api.get('/bets/events');
      setEvents(res.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
      setMessage({ type: 'error', text: 'Error al cargar eventos' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearEvent = async (eventId, eventName) => {
    if (confirmingEvent !== eventId) {
      setConfirmingEvent(eventId);
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/bets/event/${eventId}/clear`);
      setMessage({
        type: 'success',
        text: `Resultados del evento "${eventName}" limpiados exitosamente`
      });
      setConfirmingEvent(null);

      // Small delay to ensure DB transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload events with fresh data
      const res = await api.get('/bets/events');
      setEvents(res.data.data);
      setLoading(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al limpiar resultados'
      });
      setLoading(false);
    }
  };

  if (loading && events.length === 0) {
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
            <span className="text-2xl font-bold text-white">🧹 Limpiar Resultados</span>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-white hover:text-white/80 font-medium">Dashboard</button>
              <button onClick={() => navigate('/maintainers')} className="text-white hover:text-white/80 font-medium">Mantenedores</button>
              <button onClick={() => navigate('/fight-results')} className="text-white hover:text-white/80 font-medium">Resultados</button>
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

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚠️ Modo de Pruebas</h2>
          <p className="text-gray-600 mb-4">
            Esta herramienta permite limpiar los resultados de las peleas de un evento para poder realizar pruebas de apuestas nuevamente.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-yellow-700 font-semibold">⚠️ Advertencia:</p>
            <ul className="list-disc list-inside text-yellow-700 text-sm mt-2">
              <li>Esto eliminará todos los resultados (winner_id, result_type_code)</li>
              <li>Todas las apuestas volverán al estado "pending"</li>
              <li>Los usuarios podrán volver a apostar si las apuestas están abiertas</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.event_id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{event.event_name}</h3>
                  <p className="text-gray-600">
                    {new Date(event.event_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">
                      📊 {event.total_fights} peleas
                    </span>
                    <span className="text-gray-500">
                      ✅ {event.total_fights - event.pending_fights} finalizadas
                    </span>
                    <span className="text-gray-500">
                      ⏳ {event.pending_fights} pendientes
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {confirmingEvent === event.event_id ? (
                    <>
                      <button
                        onClick={() => handleClearEvent(event.event_id, event.event_name)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                      >
                        ✓ Confirmar Limpieza
                      </button>
                      <button
                        onClick={() => setConfirmingEvent(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleClearEvent(event.event_id, event.event_name)}
                      disabled={loading || event.pending_fights === event.total_fights}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🧹 Limpiar Resultados
                    </button>
                  )}

                  {event.pending_fights === event.total_fights && (
                    <span className="text-xs text-gray-500 text-center">
                      Ya está limpio
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <p className="text-gray-600">No hay eventos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClearBets;
