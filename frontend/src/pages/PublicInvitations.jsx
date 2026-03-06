import { useState, useEffect } from 'react';
import api from '../services/api';

const PublicInvitations = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/registration-tokens/public-list')
      .then(res => {
        if (res.data.success) {
          setTokens(res.data.data);
        }
      })
      .catch(() => setError('No se pudieron cargar las invitaciones.'))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (token) => {
    window.open(`/?token=${token}`, '_blank');
  };

  const labels = [
    'Entra al Octágono',
    'Únete a la Batalla',
    'Acepta el Desafío',
    'Reclama tu Lugar',
    'Entra a la Arena',
    'Demuestra tu Conocimiento',
    'Conviértete en Apostador',
    'El Octágono te Espera',
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/images/logo/logomma.png"
            alt="MMA Logo"
            className="h-16 w-auto object-contain drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 15px rgba(220, 38, 38, 0.8))' }}
          />
        </div>
        <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">
          UFC Predictions
        </h1>
        <p className="text-white/60 text-sm uppercase tracking-widest">
          MMA Metal and Gore — Invitaciones disponibles
        </p>
        <div className="mt-4 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      </div>

      {/* Content */}
      <div className="w-full max-w-lg">
        {loading && (
          <p className="text-center text-white/50 animate-pulse">Cargando invitaciones...</p>
        )}

        {error && (
          <p className="text-center text-red-400">{error}</p>
        )}

        {!loading && !error && tokens.length === 0 && (
          <div className="text-center">
            <p className="text-white/50 text-lg">No hay invitaciones disponibles en este momento.</p>
            <p className="text-white/30 text-sm mt-2">Contacta al administrador para obtener acceso.</p>
          </div>
        )}

        {!loading && !error && tokens.length > 0 && (
          <div className="space-y-4">
            <p className="text-center text-white/40 text-xs uppercase tracking-widest mb-6">
              Selecciona una invitación para registrarte
            </p>
            {tokens.map((token, index) => {
              const label = token.notes?.trim() || labels[index % labels.length];
              return (
                <button
                  key={token.token_id}
                  onClick={() => handleOpen(token.token)}
                  className="group w-full relative overflow-hidden rounded-xl border border-red-500/40 bg-gradient-to-r from-black via-red-950/40 to-black hover:from-red-950 hover:via-red-900/60 hover:to-red-950 transition-all duration-300 shadow-lg hover:shadow-red-900/40 hover:shadow-xl"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative flex items-center justify-between px-6 py-4">
                    <div className="text-left">
                      <p className="text-white font-bold text-base tracking-wide group-hover:text-red-300 transition-colors">
                        {label}
                      </p>
                      <p className="text-white/30 text-xs mt-0.5">
                        Invitación #{index + 1} · Expira {new Date(token.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">
                      <div className="bg-red-600 group-hover:bg-red-500 transition-colors rounded-lg px-4 py-2">
                        <span className="text-white text-sm font-bold uppercase tracking-wide">Registrarse</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-12 text-white/20 text-xs text-center">
        Cada invitación es de un solo uso. Una vez utilizada, no podrá ser reutilizada.
      </p>
    </div>
  );
};

export default PublicInvitations;
