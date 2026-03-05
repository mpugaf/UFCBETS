import FighterImage from './FighterImage';

const ClashIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    {/* Left arrow → */}
    <line x1="2" y1="20" x2="14" y2="20" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
    <polyline points="10,14 16,20 10,26" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Right arrow ← */}
    <line x1="38" y1="20" x2="26" y2="20" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
    <polyline points="30,14 24,20 30,26" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Center spark */}
    <line x1="20" y1="12" x2="20" y2="28" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="20" x2="27" y2="20" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="15" y1="15" x2="25" y2="25" stroke="#fde68a" strokeWidth="1" strokeLinecap="round"/>
    <line x1="25" y1="15" x2="15" y2="25" stroke="#fde68a" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="2.5" fill="#fde68a"/>
  </svg>
);

const VoidIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    {/* Dashed outer ring */}
    <circle cx="20" cy="20" r="16" stroke="#64748b" strokeWidth="2" strokeDasharray="5 3"/>
    {/* Bold X */}
    <line x1="12" y1="12" x2="28" y2="28" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
    <line x1="28" y1="12" x2="12" y2="28" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
    {/* Inner ring */}
    <circle cx="20" cy="20" r="8" stroke="#475569" strokeWidth="1" strokeDasharray="3 2"/>
  </svg>
);

const BetOption = ({ type, fighter, odds, selected, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled && odds) onClick();
  };

  const formatOdds = (oddsValue) => {
    if (oddsValue === null || oddsValue === undefined) return null;
    const numOdds = parseFloat(oddsValue);
    if (isNaN(numOdds)) return null;
    return numOdds.toFixed(2);
  };

  const formattedOdds = formatOdds(odds);
  const isDisabled = !odds || disabled;

  if (type === 'draw') {
    return (
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 p-4
          ${selected
            ? 'ring-2 ring-amber-400 bg-gradient-to-br from-amber-950/70 via-gray-900 to-amber-950/50 border border-amber-500/80 shadow-lg shadow-amber-500/20'
            : 'bg-gradient-to-br from-gray-900 via-amber-950/20 to-gray-900 border border-amber-700/30 hover:border-amber-500/60'
          }
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
        `}
      >
        {selected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent pointer-events-none"/>}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {selected && <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-xl"/>}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center
              ${selected
                ? 'bg-gradient-to-br from-amber-800/90 to-amber-950 border-2 border-amber-400/80'
                : 'bg-gradient-to-br from-amber-900/50 to-gray-900 border border-amber-600/40'
              }`}>
              <ClashIcon/>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-amber-300/50 uppercase tracking-widest mb-0.5">Resultado</div>
            <div className="text-base font-black text-amber-300 uppercase tracking-wider">Empate</div>
            {formattedOdds && (
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {formattedOdds}<span className="text-xs font-normal text-amber-600 ml-0.5">×</span>
              </div>
            )}
          </div>
          {selected && (
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black">✓ Seleccionado</span>
          )}
        </div>
      </div>
    );
  }

  if (type === 'no_contest') {
    return (
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 p-4
          ${selected
            ? 'ring-2 ring-slate-400 bg-gradient-to-br from-slate-800/70 via-gray-900 to-slate-800/50 border border-slate-500/80 shadow-lg shadow-slate-500/20'
            : 'bg-gradient-to-br from-gray-900 via-slate-800/20 to-gray-900 border border-slate-600/30 hover:border-slate-500/60'
          }
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
        `}
      >
        {selected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent pointer-events-none"/>}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {selected && <div className="absolute inset-0 rounded-full bg-slate-400/20 blur-xl"/>}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center
              ${selected
                ? 'bg-gradient-to-br from-slate-700/90 to-slate-900 border-2 border-slate-400/80'
                : 'bg-gradient-to-br from-slate-800/50 to-gray-900 border border-slate-600/40'
              }`}>
              <VoidIcon/>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400/50 uppercase tracking-widest mb-0.5">Resultado</div>
            <div className="text-base font-black text-slate-300 uppercase tracking-wider">No Contest</div>
            {formattedOdds && (
              <div className="text-xl font-black text-slate-300 mt-0.5">
                {formattedOdds}<span className="text-xs font-normal text-slate-500 ml-0.5">×</span>
              </div>
            )}
          </div>
          {selected && (
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-slate-500 text-white">✓ Seleccionado</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 p-4
        ${selected
          ? 'ring-2 ring-red-400 bg-gradient-to-br from-red-950/60 via-gray-900 to-red-950/40 border border-red-500/70 shadow-lg shadow-red-500/20'
          : 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 border border-white/10 hover:border-white/25'
        }
        ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {selected && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent pointer-events-none"/>}
      <div className="flex flex-col items-center gap-3">
        <FighterImage imagePath={fighter?.image_path} fighterName={fighter?.name} size="lg"/>
        <div className="text-center">
          <div className="text-sm font-bold text-white">{fighter?.name}</div>
          {formattedOdds && (
            <div className="text-xl font-black text-red-400 mt-0.5">
              {formattedOdds}<span className="text-xs font-normal text-red-700 ml-0.5">×</span>
            </div>
          )}
        </div>
        {selected && (
          <span className="px-3 py-0.5 rounded-full text-xs font-black bg-red-500 text-white">✓ Seleccionado</span>
        )}
      </div>
    </div>
  );
};

export default BetOption;
