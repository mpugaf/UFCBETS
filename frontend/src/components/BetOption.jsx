import FighterImage from './FighterImage';

const BetOption = ({ type, fighter, odds, selected, onClick, disabled, corner }) => {
  const handleClick = () => {
    if (!disabled && odds) onClick();
  };

  const formatOdds = (v) => {
    if (v === null || v === undefined) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n.toFixed(2);
  };

  const formattedOdds = formatOdds(odds);
  const isDisabled = !odds || disabled;

  /* ── DRAW ── */
  if (type === 'draw') {
    return (
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`relative w-full rounded-2xl overflow-hidden transition-all duration-200 focus:outline-none
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]'}
          ${selected
            ? 'ring-4 ring-amber-400 shadow-[0_0_24px_4px_rgba(251,191,36,0.5)]'
            : 'hover:shadow-[0_0_16px_2px_rgba(251,191,36,0.25)]'}
        `}
      >
        {/* background */}
        <div className={`absolute inset-0 transition-all duration-200 ${
          selected
            ? 'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700'
            : 'bg-gradient-to-b from-amber-900 via-yellow-950 to-black'
        }`} />
        {/* shine */}
        {selected && <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />}

        <div className="relative z-10 flex flex-col items-center gap-2 py-5 px-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg
            ${selected ? 'bg-white/20 border-white/60' : 'bg-amber-800/50 border-amber-500/60'}`}>
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
              <line x1="2" y1="20" x2="14" y2="20" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
              <polyline points="10,14 16,20 10,26" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <line x1="38" y1="20" x2="26" y2="20" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
              <polyline points="30,14 24,20 30,26" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="20" cy="20" r="2.5" fill="#fde68a"/>
            </svg>
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-widest ${selected ? 'text-white/80' : 'text-amber-400/70'}`}>
            Resultado
          </span>
          <span className={`text-base font-black uppercase tracking-wide ${selected ? 'text-white' : 'text-amber-300'}`}>
            Empate
          </span>
          {formattedOdds && (
            <span className={`text-2xl font-black ${selected ? 'text-white' : 'text-amber-400'}`}>
              {formattedOdds}<span className="text-sm font-normal opacity-70 ml-0.5">×</span>
            </span>
          )}
          {selected && (
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-white/30 text-white backdrop-blur-sm">
              ✓ Seleccionado
            </span>
          )}
        </div>
      </button>
    );
  }

  /* ── NO CONTEST ── */
  if (type === 'no_contest') {
    return (
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`relative w-full rounded-2xl overflow-hidden transition-all duration-200 focus:outline-none
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]'}
          ${selected
            ? 'ring-4 ring-slate-400 shadow-[0_0_24px_4px_rgba(148,163,184,0.4)]'
            : 'hover:shadow-[0_0_16px_2px_rgba(148,163,184,0.15)]'}
        `}
      >
        <div className={`absolute inset-0 transition-all duration-200 ${
          selected
            ? 'bg-gradient-to-b from-slate-400 via-slate-500 to-slate-800'
            : 'bg-gradient-to-b from-slate-800 via-slate-900 to-black'
        }`} />
        {selected && <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />}

        <div className="relative z-10 flex flex-col items-center gap-2 py-5 px-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg
            ${selected ? 'bg-white/20 border-white/50' : 'bg-slate-700/50 border-slate-500/50'}`}>
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
              <circle cx="20" cy="20" r="16" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 3"/>
              <line x1="12" y1="12" x2="28" y2="28" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
              <line x1="28" y1="12" x2="12" y2="28" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-widest ${selected ? 'text-white/80' : 'text-slate-400/70'}`}>
            Resultado
          </span>
          <span className={`text-base font-black uppercase tracking-wide ${selected ? 'text-white' : 'text-slate-300'}`}>
            No Contest
          </span>
          {formattedOdds && (
            <span className={`text-2xl font-black ${selected ? 'text-white' : 'text-slate-300'}`}>
              {formattedOdds}<span className="text-sm font-normal opacity-70 ml-0.5">×</span>
            </span>
          )}
          {selected && (
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-white/25 text-white backdrop-blur-sm">
              ✓ Seleccionado
            </span>
          )}
        </div>
      </button>
    );
  }

  /* ── FIGHTER (red / blue) ── */
  const isRed = corner === 'red';
  const colors = isRed
    ? {
        idle:     'bg-gradient-to-b from-red-900 via-red-950 to-black border border-red-700/50',
        active:   'bg-gradient-to-b from-red-500 via-red-700 to-red-900',
        ring:     'ring-red-400 shadow-[0_0_28px_4px_rgba(239,68,68,0.55)]',
        hoverGlow:'hover:shadow-[0_0_18px_2px_rgba(239,68,68,0.3)]',
        label:    isRed ? 'text-red-300' : 'text-blue-300',
        odds:     isRed ? 'text-red-300' : 'text-blue-300',
        badge:    'bg-red-500',
        corner:   '🔴 ROJO',
      }
    : {
        idle:     'bg-gradient-to-b from-blue-900 via-blue-950 to-black border border-blue-700/50',
        active:   'bg-gradient-to-b from-blue-500 via-blue-700 to-blue-900',
        ring:     'ring-blue-400 shadow-[0_0_28px_4px_rgba(59,130,246,0.55)]',
        hoverGlow:'hover:shadow-[0_0_18px_2px_rgba(59,130,246,0.3)]',
        label:    'text-blue-300',
        odds:     'text-blue-300',
        badge:    'bg-blue-500',
        corner:   '🔵 AZUL',
      };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`relative w-full rounded-2xl overflow-hidden transition-all duration-200 focus:outline-none
        ${isDisabled ? 'opacity-40 cursor-not-allowed' : `cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${colors.hoverGlow}`}
        ${selected ? `ring-4 ${colors.ring}` : ''}
      `}
    >
      <div className={`absolute inset-0 transition-all duration-200 ${selected ? colors.active : colors.idle}`} />
      {selected && <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />}
      {/* diagonal texture */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,white 8px,white 9px)' }} />

      <div className="relative z-10 flex flex-col items-center gap-2 py-5 px-3">
        {/* corner label */}
        <span className={`text-[10px] font-black uppercase tracking-widest ${selected ? 'text-white/70' : colors.label}`}>
          {colors.corner}
        </span>

        {/* fighter image */}
        <div className={`rounded-full overflow-hidden border-4 shadow-xl transition-all duration-200
          ${selected
            ? 'border-white/70 shadow-white/20'
            : isRed ? 'border-red-500/60 shadow-red-900/40' : 'border-blue-500/60 shadow-blue-900/40'
          }`}>
          <FighterImage imagePath={fighter?.image_path} fighterName={fighter?.name} size="lg" />
        </div>

        {/* name */}
        <span className={`text-sm font-black text-center leading-tight ${selected ? 'text-white' : 'text-white/90'}`}>
          {fighter?.name}
        </span>

        {/* odds */}
        {formattedOdds && (
          <span className={`text-2xl font-black ${selected ? 'text-white' : colors.odds}`}>
            {formattedOdds}<span className="text-sm font-normal opacity-70 ml-0.5">×</span>
          </span>
        )}

        {selected && (
          <span className={`px-3 py-0.5 rounded-full text-xs font-black text-white ${colors.badge}`}>
            ✓ Seleccionado
          </span>
        )}
      </div>
    </button>
  );
};

export default BetOption;
