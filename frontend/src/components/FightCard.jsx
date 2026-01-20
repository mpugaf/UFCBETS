import React from 'react';
import BetOption from './BetOption';

const FightCard = ({ fight, onBetChange, currentBet, disabled = false, existingBet = null, isLocked = false }) => {
  // Support both old and new data structures
  const redFighter = fight.red_fighter || {
    name: fight.red_fighter_name,
    image_path: fight.red_fighter_image,
    id: fight.red_fighter_id
  };

  const blueFighter = fight.blue_fighter || {
    name: fight.blue_fighter_name,
    image_path: fight.blue_fighter_image,
    id: fight.blue_fighter_id
  };

  // Normalize structure
  const normalizedRedFighter = {
    name: redFighter.fighter_name || redFighter.name,
    image_path: redFighter.image_path,
    id: redFighter.fighter_id || redFighter.id
  };

  const normalizedBlueFighter = {
    name: blueFighter.fighter_name || blueFighter.name,
    image_path: blueFighter.image_path,
    id: blueFighter.fighter_id || blueFighter.id
  };

  const redOdds = redFighter.odds || fight.red_odds;
  const blueOdds = blueFighter.odds || fight.blue_odds;

  const handleBetSelection = (betType, fighterId, odds) => {
    if (isLocked) {
      return; // No permitir cambios si está bloqueado
    }
    onBetChange(fight.fight_id, {
      bet_type: betType,
      predicted_winner_id: fighterId,
      odds_value: odds
    });
  };

  // Si hay una apuesta existente, usarla para mostrar la selección
  const displayBet = existingBet || currentBet;

  const isRedSelected = displayBet && displayBet.bet_type === 'fighter_win' && displayBet.predicted_winner_id === normalizedRedFighter.id;
  const isBlueSelected = displayBet && displayBet.bet_type === 'fighter_win' && displayBet.predicted_winner_id === normalizedBlueFighter.id;
  const isDrawSelected = displayBet && displayBet.bet_type === 'draw';
  const isNoContestSelected = displayBet && displayBet.bet_type === 'no_contest';

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-4 ${isLocked ? 'border-2 border-green-500 relative' : ''}`}>
      {isLocked && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          🔒 Apuesta Confirmada
        </div>
      )}
      <div className="mb-4 border-b pb-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{fight.event_name}</h3>
            <p className="text-sm text-gray-600">{fight.weight_class_name || 'Peso no especificado'}</p>
          </div>
          <div className="text-right">
            {Boolean(fight.is_main_event) && (
              <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full mb-1">
                MAIN EVENT
              </span>
            )}
            {Boolean(fight.is_title_fight) && (
              <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                TITLE FIGHT
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BetOption
          type="fighter"
          fighter={normalizedRedFighter}
          odds={redOdds}
          selected={isRedSelected}
          onClick={() => handleBetSelection('fighter_win', normalizedRedFighter.id, redOdds)}
          disabled={disabled}
        />

        <BetOption
          type="draw"
          odds={fight.draw_odds || 10.00}
          selected={isDrawSelected}
          onClick={() => handleBetSelection('draw', null, fight.draw_odds || 10.00)}
          disabled={disabled}
        />

        <BetOption
          type="no_contest"
          odds={fight.no_contest_odds || 15.00}
          selected={isNoContestSelected}
          onClick={() => handleBetSelection('no_contest', null, fight.no_contest_odds || 15.00)}
          disabled={disabled}
        />

        <BetOption
          type="fighter"
          fighter={normalizedBlueFighter}
          odds={blueOdds}
          selected={isBlueSelected}
          onClick={() => handleBetSelection('fighter_win', normalizedBlueFighter.id, blueOdds)}
          disabled={disabled}
        />
      </div>

      {displayBet && (
        <div className={`mt-4 p-3 rounded-lg ${isLocked ? 'bg-green-50 border border-green-300' : 'bg-blue-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-700">Apuesta: </span>
              <span className="font-semibold">{displayBet.bet_amount || 100} puntos</span>
              {isLocked && <span className="ml-2 text-xs text-green-600 font-semibold">✓ Confirmada</span>}
            </div>
            <div>
              <span className="text-sm text-gray-700">Ganancia potencial: </span>
              <span className="font-bold text-green-600">
                {displayBet.potential_return || ((displayBet.bet_amount || 100) * displayBet.odds_value).toFixed(2)} puntos
              </span>
            </div>
          </div>
          {isLocked && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              Esta apuesta no puede ser modificada
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FightCard;
