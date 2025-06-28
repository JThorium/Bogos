import React from 'react';
import { useGame } from '../game/GameProvider';
import { ufos } from '../game/UFOData';
import UFOPreview from './UFOPreview';

const HangarScreen = ({ onBack }) => {
  const { gameState, selectUFO, unlockUFO, updateGameState } = useGame();
  const { selectedUFOId, unlockedUFOIds, starCredits, hasPurchasedScoreBoost, spawnMultiplier } = gameState;

  // Score Boost Logic
  const scoreBoostCost = 1000;
  const handlePurchaseScoreBoost = () => {
    if (starCredits >= scoreBoostCost && !hasPurchasedScoreBoost) {
      updateGameState((prev) => ({
        starCredits: prev.starCredits - scoreBoostCost,
        hasPurchasedScoreBoost: true,
      }));
      console.log('Score Boost purchased!');
    }
  };

  // Challenge Mode Logic
  const challengeModeCosts = { 1: 100000, 2: 1000000 };
  const handleUpgradeChallengeMode = (level) => {
    const cost = challengeModeCosts[level];
    if (starCredits >= cost && spawnMultiplier < (level * 2)) { // Check if not already at this level or higher
      updateGameState((prev) => ({
        starCredits: prev.starCredits - cost,
        spawnMultiplier: level * 2, // 2x or 4x
      }));
      console.log(`Challenge Mode upgraded to ${level * 2}x spawn!`);
    }
  };

  // Fusion Lab Logic (Placeholder for now)
  const handleFusionLabClick = () => {
    console.log('Fusion Lab button clicked!');
    // Implement actual Fusion Lab logic here later
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start text-white p-4 pt-4 pb-4"> {/* Adjusted padding */}
      <h1 className="text-4xl font-bold mb-2 text-yellow-400">Hangar</h1> {/* Adjusted margin-bottom */}
      <p className="text-lg mb-2">STAR CREDITS: {starCredits.toLocaleString()}</p> {/* Adjusted margin-bottom */}

      {/* Main Hangar Content Area */}
      <div className="flex flex-col w-full max-w-6xl flex-grow bg-gray-900 rounded-lg shadow-lg p-4 relative overflow-hidden">
        
        {/* Top Section: Preview and Main Options */}
        <div className="flex flex-col md:flex-row flex-grow mb-2"> {/* Adjusted margin-bottom */}
          {/* UFO Preview Section */}
          <div className="w-full md:w-3/5 flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg mb-2 md:mb-0 md:mr-2"> {/* Adjusted margins */}
            <h2 className="text-2xl font-bold mb-2">Selected UFO Preview</h2> {/* Adjusted margin-bottom */}
            <div className="w-full h-48 bg-black rounded-lg"> {/* Reduced height */}
              <UFOPreview ufoData={ufos.find(u => u.id === selectedUFOId)} />
            </div>
            <p className="text-xl font-bold mt-2">{ufos.find(u => u.id === selectedUFOId)?.name}</p> {/* Adjusted margin-top */}
          </div>

          {/* Side Options (Score Boost, Challenge Mode, Fusion Lab, Upgrades) */}
          <div className="w-full md:w-2/5 flex flex-col p-4 bg-gray-800 rounded-lg space-y-2 overflow-y-auto"> {/* Adjusted space-y */}
            <h2 className="text-2xl font-bold mb-1">Hangar Options</h2> {/* Adjusted margin-bottom */}
            
            {/* Score Boost Button */}
            <button
              className={`py-2 px-4 rounded-lg text-base font-bold transition-colors duration-200 shadow-lg ${hasPurchasedScoreBoost ? 'bg-gray-500 cursor-not-allowed' : (starCredits >= scoreBoostCost ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-500 cursor-not-allowed')}`}
              onClick={handlePurchaseScoreBoost}
              disabled={hasPurchasedScoreBoost || starCredits < scoreBoostCost}
            >
              {hasPurchasedScoreBoost ? 'SCORE BOOST ACTIVE' : `Skip Run (Boost Score) - ${scoreBoostCost.toLocaleString()} CR`}
            </button>

            {/* Challenge Mode Button */}
            {spawnMultiplier === 1 && (
                <button
                className={`py-2 px-4 rounded-lg text-base font-bold transition-colors duration-200 shadow-lg ${starCredits >= challengeModeCosts[1] ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500 cursor-not-allowed'}`}
                onClick={() => handleUpgradeChallengeMode(1)}
                disabled={starCredits < challengeModeCosts[1]}
                >
                Challenge Mode (Bring it ON!) - {challengeModeCosts[1].toLocaleString()} CR
                </button>
            )}
            {spawnMultiplier === 2 && (
                <button
                className={`py-2 px-4 rounded-lg text-base font-bold transition-colors duration-200 shadow-lg ${starCredits >= challengeModeCosts[2] ? 'bg-red-800 hover:bg-red-900' : 'bg-gray-500 cursor-not-allowed'}`}
                onClick={() => handleUpgradeChallengeMode(2)}
                disabled={starCredits < challengeModeCosts[2]}
                >
                NO REALLY, BRING IT OOON! - {challengeModeCosts[2].toLocaleString()} CR
                </button>
            )}
            {spawnMultiplier === 4 && (
                <button
                className="py-2 px-4 bg-gray-500 cursor-not-allowed text-white font-bold rounded-lg text-base transition-colors duration-200 shadow-lg"
                disabled
                >
                MAXIMUM CARNAGE
                </button>
            )}

            {/* Fusion Lab Button */}
            <button
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-base transition-colors duration-200 shadow-lg"
              onClick={handleFusionLabClick}
            >
              Fusion Lab
            </button>
            
            {/* Placeholder for Upgrades/Power-ups */}
            <h3 className="text-xl font-bold mt-2">Upgrades (Coming Soon)</h3> {/* Adjusted margin-top */}
            <div className="flex-grow border border-gray-700 rounded-lg p-2 text-gray-400 text-center">
                Upgrade slots will appear here.
            </div>
          </div>
        </div>

        {/* Bottom Section: UFO Selection List (Horizontal Scroll) */}
        <div className="w-full flex-grow bg-gray-800 rounded-lg p-4 mt-2"> {/* Adjusted margin-top */}
          <h2 className="text-2xl font-bold mb-2">Select UFO</h2> {/* Adjusted margin-bottom */}
          <div className="flex flex-row overflow-x-auto space-x-2 pb-2"> {/* Adjusted space-x */}
            {ufos.map((ufo) => {
              const isUnlocked = unlockedUFOIds.has(ufo.id);
              const isSelected = selectedUFOId === ufo.id;
              const canAfford = starCredits >= ufo.cost;

              return (
                <div 
                  key={ufo.id} 
                  className={`flex-shrink-0 w-96 border-2 p-2 rounded-lg text-center ${isSelected ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 bg-gray-800'} ${!isUnlocked ? 'opacity-50' : ''}`}> {/* Adjusted padding */}
                  <h3 className="text-base font-bold whitespace-normal" style={{ color: ufo.colors && ufo.colors.length >= 3 ? `rgb(${ufo.colors[0]*255},${ufo.colors[1]*255},${ufo.colors[2]*255})` : 'white' }}>{ufo.name}</h3> {/* Adjusted font-size */}
                  <p className="text-xs text-gray-300 mb-1">{ufo.ability || 'No ability listed'}</p> {/* Adjusted font-size and margin-bottom */}
                  
                  {!isUnlocked ? (
                    <div className="mt-2"> {/* Adjusted margin-top */}
                      <p className="text-xs text-red-400 mb-1"> {/* Adjusted font-size and margin-bottom */}
                        {ufo.unlockMethod === 'score' ? `Unlock at ${ufo.unlockScore.toLocaleString()} pts` : `Cost: ${ufo.cost.toLocaleString()} CR`}
                      </p>
                      {ufo.unlockMethod === 'credits' && (
                        <button 
                          className={`py-1 px-2 rounded-lg text-xs font-bold ${canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'}`}
                          onClick={() => unlockUFO(ufo.id, ufo.cost)}
                          disabled={!canAfford}
                        >
                          BUY
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      className={`mt-2 py-1 px-2 rounded-lg text-xs font-bold ${isSelected ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      onClick={() => selectUFO(ufo.id)}
                      disabled={isSelected}
                    >
                      {isSelected ? 'SELECTED' : 'SELECT'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Back Button (positioned outside the main content div to ensure visibility) */}
      <button
        className="mt-2 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg text-lg transition-colors duration-200 shadow-lg" /* Adjusted margins, padding, font-size */
        onClick={onBack}
      >
        Back to Main Menu
      </button>
    </div>
  );
};

export default HangarScreen;
