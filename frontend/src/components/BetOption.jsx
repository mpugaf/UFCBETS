import React from 'react';
import FighterImage from './FighterImage';

const BetOption = ({ type, fighter, odds, selected, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled && odds) {
      onClick();
    }
  };

  const renderContent = () => {
    if (type === 'draw') {
      return (
        <div className="flex flex-col items-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
            ⚖️
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">Empate</div>
            {odds && <div className="text-xl font-bold text-blue-600">{odds.toFixed(2)}</div>}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-2">
        <FighterImage
          imagePath={fighter?.image_path}
          fighterName={fighter?.name}
          size="lg"
        />
        <div className="text-center">
          <div className="font-semibold text-lg">{fighter?.name}</div>
          {odds && <div className="text-xl font-bold text-blue-600">{odds.toFixed(2)}</div>}
        </div>
      </div>
    );
  };

  const baseClasses = "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg";
  const selectedClasses = selected
    ? "border-blue-500 bg-blue-50 shadow-lg"
    : "border-gray-300 bg-white hover:border-blue-300";
  const disabledClasses = !odds || disabled
    ? "opacity-50 cursor-not-allowed"
    : "";

  return (
    <div
      className={`${baseClasses} ${selectedClasses} ${disabledClasses}`}
      onClick={handleClick}
    >
      {renderContent()}
      {selected && (
        <div className="mt-2 text-center">
          <span className="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
            Seleccionado ✓
          </span>
        </div>
      )}
    </div>
  );
};

export default BetOption;
