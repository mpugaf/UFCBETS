import { useState, useEffect } from 'react';
import api from '../services/api';

const FighterAvatar = ({ name, imagePath, corner }) => {
  const [imgError, setImgError] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const cornerColor = corner === 'red' ? 'from-red-700 to-red-900' : 'from-blue-700 to-blue-900';

  if (!imagePath || imgError) {
    return (
      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${cornerColor} flex items-center justify-center text-white text-3xl font-black shadow-lg border-2 ${corner === 'red' ? 'border-red-500' : 'border-blue-500'}`}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={`/images/fighters/${imagePath}`}
      alt={name}
      onError={() => setImgError(true)}
      className={`w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-lg border-2 ${corner === 'red' ? 'border-red-500' : 'border-blue-500'}`}
    />
  );
};

const Cartelera = ({ eventId, onBack }) => {
  const [fights, setFights] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    loadFights();
  }, [eventId]);

  const loadFights = async () => {
    try {
      const [fightsRes, eventsRes] = await Promise.all([
        api.get(`/bets/fights/${eventId}`),
        api.get('/bets/events')
      ]);
      setFights(fightsRes.data.data || []);
      const ev = (eventsRes.data.data || []).find(e => e.event_id === parseInt(eventId));
      setEventInfo(ev || null);
    } catch (error) {
      console.error('Error loading cartelera:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Group fights by category preserving SQL order (fights arrive already sorted)
  const grouped = [];
  const seenCats = {};
  fights.forEach(fight => {
    const key = fight.category_code || 'main_card';
    if (!seenCats[key]) {
      seenCats[key] = { name: fight.category_name || key, cat_order: fight.display_order ?? 0, fights: [] };
      grouped.push(seenCats[key]);
    }
    seenCats[key].fights.push(fight);
  });
  // Already sorted DESC by cat_order from backend, so grouped is most important first

  const categoryStyle = {
    title_fight: {
      label: 'PELEA POR EL TÍTULO',
      cardBg: 'from-yellow-950/80 via-black to-black',
      border: 'border-yellow-500',
      headerBadge: 'bg-yellow-500 text-black',
      glow: 'shadow-yellow-900/50',
      nameSize: 'text-lg md:text-xl',
    },
    main_card: {
      label: 'CARTELERA ESTELAR',
      cardBg: 'from-red-950/60 via-black to-black',
      border: 'border-red-700',
      headerBadge: 'bg-red-700 text-white',
      glow: 'shadow-red-900/30',
      nameSize: 'text-base md:text-lg',
    },
    preliminary: {
      label: 'PRELIMINARES',
      cardBg: 'from-slate-900/70 via-black to-black',
      border: 'border-slate-600',
      headerBadge: 'bg-slate-600 text-white',
      glow: '',
      nameSize: 'text-sm md:text-base',
    },
  };

  const getStyle = (code) => categoryStyle[code] || categoryStyle.main_card;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-white text-xl">Cargando cartelera...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-white/20 shrink-0"
        >
          ← Volver
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              {eventInfo?.event_name || `Evento #${eventId}`}
            </span>
          </h1>
          {eventInfo?.event_date && (
            <p className="text-white/40 text-xs mt-0.5 capitalize">
              {formatDate(eventInfo.event_date)}
              {eventInfo?.venue && ` • ${eventInfo.venue}, ${eventInfo.city}`}
            </p>
          )}
        </div>
      </div>

      {fights.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🥊</div>
          <p className="text-white/60 text-lg">No hay peleas registradas para este evento</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(({ name, cat_order, fights: catFights }, catIdx) => {
            const catCode = catFights[0]?.category_code || 'main_card';
            const style = getStyle(catCode);

            return (
              <div key={catCode}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest ${style.headerBadge}`}>
                    {style.label}
                  </span>
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-white/20 text-xs">{catFights.length} pelea{catFights.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Fight cards */}
                <div className="space-y-4">
                  {catFights.map((fight, fightIdx) => {
                    const hasResult = !!fight.result_type_code;
                    const isDraw = fight.result_type_code === 'draw';
                    const isNC = fight.result_type_code === 'no_contest';
                    const redWon = hasResult && !isDraw && !isNC && fight.winner_id === fight.red_fighter_id;
                    const blueWon = hasResult && !isDraw && !isNC && fight.winner_id === fight.blue_fighter_id;
                    const isTitle = !!fight.is_title_fight || catCode === 'title_fight';

                    return (
                      <div
                        key={fight.fight_id}
                        className={`relative rounded-2xl border-2 overflow-hidden ${style.border} ${catIdx === 0 && fightIdx === 0 ? `shadow-2xl ${style.glow}` : 'shadow-lg'}`}
                      >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${style.cardBg}`}></div>
                        {/* Subtle diagonal pattern */}
                        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)' }}></div>

                        <div className="relative z-10 p-4 md:p-5">
                          {/* Top badges row */}
                          <div className="flex items-center gap-2 mb-4">
                            {isTitle && (
                              <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-black rounded tracking-wider">
                                CAMPEONATO
                              </span>
                            )}
                            {isDraw && <span className="px-2 py-0.5 bg-yellow-700 text-white text-xs font-bold rounded">EMPATE</span>}
                            {isNC && <span className="px-2 py-0.5 bg-gray-600 text-white text-xs font-bold rounded">NO CONTEST</span>}
                            {!hasResult && (
                              <span className="px-2 py-0.5 bg-white/10 text-white/50 text-xs rounded">PENDIENTE</span>
                            )}
                            <span className="ml-auto text-xs text-white/40 font-medium">{fight.weight_class_name}</span>
                          </div>

                          {/* Fighters row */}
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-6">

                            {/* Red corner */}
                            <div className={`flex flex-col items-center gap-2 transition-opacity ${hasResult && !isDraw && !isNC && !redWon ? 'opacity-35' : ''}`}>
                              <div className="relative">
                                <FighterAvatar
                                  name={fight.red_fighter_name}
                                  imagePath={fight.red_fighter_image}
                                  corner="red"
                                />
                                {redWon && (
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs font-black">W</span>
                                  </div>
                                )}
                              </div>
                              <p className={`${style.nameSize} font-black text-center leading-tight ${redWon ? 'text-white' : 'text-white/80'}`}>
                                {fight.red_fighter_name}
                              </p>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-red-400 text-xs font-bold">ROJO</span>
                              </div>
                              {redWon && (
                                <span className="text-green-400 text-xs font-black tracking-wider">GANADOR</span>
                              )}
                            </div>

                            {/* VS */}
                            <div className="flex flex-col items-center gap-1 px-2">
                              <span className="text-white/20 text-xl font-black">VS</span>
                              {isDraw && <span className="text-yellow-400 text-xs font-bold">EMPATE</span>}
                            </div>

                            {/* Blue corner */}
                            <div className={`flex flex-col items-center gap-2 transition-opacity ${hasResult && !isDraw && !isNC && !blueWon ? 'opacity-35' : ''}`}>
                              <div className="relative">
                                <FighterAvatar
                                  name={fight.blue_fighter_name}
                                  imagePath={fight.blue_fighter_image}
                                  corner="blue"
                                />
                                {blueWon && (
                                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs font-black">W</span>
                                  </div>
                                )}
                              </div>
                              <p className={`${style.nameSize} font-black text-center leading-tight ${blueWon ? 'text-white' : 'text-white/80'}`}>
                                {fight.blue_fighter_name}
                              </p>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-blue-400 text-xs font-bold">AZUL</span>
                              </div>
                              {blueWon && (
                                <span className="text-green-400 text-xs font-black tracking-wider">GANADOR</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Cartelera;
