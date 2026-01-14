import React from 'react';
import BetOption from './BetOption';

const FightCard = ({ fight, onBetChange, currentBet }) => {
  const redFighter = {
    name: fight.red_fighter_name,
    image_path: fight.red_fighter_image,
    id: fight.red_fighter_id
  };

  const blueFighter = {
    name: fight.blue_fighter_name,
    image_path: fight.blue_fighter_image,
    id: fight.blue_fighter_id
  };

  const handleBetSelection = (betType, fighterId, odds) => {
    onBetChange(fight.fight_id, {
      bet_type: betType,
      predicted_winner_id: fighterId,
      odds_value: odds
    });
  };

  const isRedSelected = currentBet && currentBet.bet_type === 'fighter_win' && currentBet.predicted_winner_id === redFighter.id;
  const isBlueSelected = currentBet && currentBet.bet_type === 'fighter_win' && currentBet.predicted_winner_id === blueFighter.id;
  const isDrawSelected = currentBet && currentBet.bet_type === 'draw';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="mb-4 border-b pb-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{fight.event_name}</h3>
            <p className="text-sm text-gray-600">{fight.weight_class_name || 'Peso no especificado'}</p>
          </div>
          <div className="text-right">
            {fight.is_main_event && (
              <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full mb-1">
                MAIN EVENT
              </span>
            )}
            {fight.is_title_fight && (
              <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                TITLE FIGHT
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BetOption
          type="fighter"
          fighter={redFighter}
          odds={fight.red_odds}
          selected={isRedSelected}
          onClick={() => handleBetSelection('fighter_win', redFighter.id, fight.red_odds)}
        />

        {fight.draw_odds && (
          <BetOption
            type="draw"
            odds={fight.draw_odds}
            selected={isDrawSelected}
            onClick={() => handleBetSelection('draw', null, fight.draw_odds)}
          />
        )}

        <BetOption
          type="fighter"
          fighter={blueFighter}
          odds={fight.blue_odds}
          selected={isBlueSelected}
          onClick={() => handleBetSelection('fighter_win', blueFighter.id, fight.blue_odds)}
        />
      </div>

      {currentBet && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-700">Apuesta: </span>
              <span className="font-semibold">100 puntos</span>
            </div>
            <div>
              <span className="text-sm text-gray-700">Ganancia potencial: </span>
              <span className="font-bold text-green-600">
                {(100 * currentBet.odds_value).toFixed(2)} puntos
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FightCard;
