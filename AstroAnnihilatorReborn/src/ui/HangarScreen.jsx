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

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">Hangar</h1>
      <p className="text-lg mb-4">STAR CREDITS: {starCredits.toLocaleString()}</p>

      {/* Main Hangar Content Area */}
      <div className="flex flex-col w-full max-w-6xl h-[80vh] bg-gray-900 rounded-lg shadow-lg p-4 relative">
        
        {/* Top Section: Preview and Main Options */}
        <div className="flex flex-col md:flex-row flex-grow mb-4">
          {/* UFO Preview Section */}
          <div className="w-full md:w-1/2 h-full md:h-full flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg mb-4 md:mb-0 md:mr-4">
            <h2 className="text-2xl font-bold mb-4">Selected UFO Preview</h2>
            <div className="w-full h-64 bg-black rounded-lg">
              <UFOPreview ufoData={ufos.find(u => u.id === selectedUFOId)} />
            </div>
            <p className="text-xl font-bold mt-4">{ufos.find(u => u.id === selectedUFOId)?.name}</p>
          </div>

          {/* Side Options (Score Boost, Challenge Mode, Fusion Lab, Upgrades) */}
          <div className="w-full md:w-1/2 h-full flex flex-col p-4 bg-gray-800 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold mb-2">Hangar Options</h2>
            
            {/* Score Boost Button */}
            <button
              className={`py-3 px-6 rounded-lg text-lg font-bold transition-colors duration-200 shadow-lg ${hasPurchasedScoreBoost ? 'bg-gray-500 cursor-not-allowed' : (starCredits >= scoreBoostCost ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-500 cursor-not-allowed')}`}
              onClick={handlePurchaseScoreBoost}
              disabled={hasPurchasedScoreBoost || starCredits < scoreBoostCost}
            >
              {hasPurchasedScoreBoost ? 'SCORE BOOST ACTIVE' : `Skip Run (Boost Score) - ${scoreBoostCost.toLocaleString()} CR`}
            </button>

            {/* Challenge Mode Button */}
            {spawnMultiplier === 1 && (
                <button
                className={`py-3 px-6 rounded-lg text-lg font-bold transition-colors duration-200 shadow-lg ${starCredits >= challengeModeCosts[1] ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-500 cursor-not-allowed'}`}
                onClick={() => handleUpgradeChallengeMode(1)}
                disabled={starCredits < challengeModeCosts[1]}
                >
                Challenge Mode (Bring it ON!) - {challengeModeCosts[1].toLocaleString()} CR
                </button>
            )}
            {spawnMultiplier === 2 && (
                <button
                className={`py-3 px-6 rounded-lg text-lg font-bold transition-colors duration-200 shadow-lg ${starCredits >= challengeModeCosts[2] ? 'bg-red-800 hover:bg-red-900' : 'bg-gray-500 cursor-not-allowed'}`}
                onClick={() => handleUpgradeChallengeMode(2)}
                disabled={starCredits < challengeModeCosts[2]}
                >
                NO REALLY, BRING IT OOON! - {challengeModeCosts[2].toLocaleString()} CR
                </button>
            )}
            {spawnMultiplier === 4 && (
                <button
                className="py-3 px-6 bg-gray-500 cursor-not-allowed text-white font-bold rounded-lg text-lg transition-colors duration-200 shadow-lg"
                disabled
                >
                MAXIMUM CARNAGE
                </button>
            )}

            {/* Fusion Lab Button */}
            <button
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-lg transition-colors duration-200 shadow-lg"
              onClick={handleFusionLabClick} // Corrected to handleFusionLabClick
            >
              Fusion Lab
            </button>
            
            {/* Placeholder for Upgrades/Power-ups */}
            <h3 className="text-xl font-bold mt-4">Upgrades (Coming Soon)</h3>
            <div className="flex-grow border border-gray-700 rounded-lg p-2 text-gray-400 text-center">
                Upgrade slots will appear here.
            </div>
          </div>
        </div>

        {/* Bottom Section: UFO Selection List (Horizontal Scroll) */}
        <div className="w-full flex-shrink-0 bg-gray-800 rounded-lg p-4 mt-4">
          <h2 className="text-2xl font-bold mb-4">Select UFO</h2>
          <div className="flex flex-row overflow-x-auto space-x-4 pb-2"> {/* Horizontal scroll */}
            {ufos.map((ufo) => {
              const isUnlocked = unlockedUFOIds.has(ufo.id);
              const isSelected = selectedUFOId === ufo.id;
              const canAfford = starCredits >= ufo.cost;

              return (
                <div 
                  key={ufo.id} 
                  className={`flex-shrink-0 w-48 border-2 p-4 rounded-lg text-center ${isSelected ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 bg-gray-800'} ${!isUnlocked ? 'opacity-50' : ''}`}
                >
                  <h3 className="text-xl font-bold" style={{ color: ufo.colors && ufo.colors.length >= 3 ? `rgb(${ufo.colors[0]*255},${ufo.colors[1]*255},${ufo.colors[2]*255})` : 'white' }}>{ufo.name}</h3>
                  <p className="text-sm text-gray-300 mb-2">{ufo.ability || 'No ability listed'}</p>
                  
                  {!isUnlocked ? (
                    <div className="mt-4">
                      <p className="text-sm text-red-400 mb-2">
                        {ufo.unlockMethod === 'score' ? `Unlock at ${ufo.unlockScore.toLocaleString()} pts` : `Cost: ${ufo.cost.toLocaleString()} CR`}
                      </p>
                      {ufo.unlockMethod === 'credits' && (
                        <button 
                          className={`py-2 px-4 rounded-lg text-sm font-bold ${canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'}`}
                          onClick={() => unlockUFO(ufo.id, ufo.cost)}
                          disabled={!canAfford}
                        >
                          BUY
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      className={`mt-4 py-2 px-4 rounded-lg text-sm font-bold ${isSelected ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
        className="mt-4 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg text-xl transition-colors duration-200 shadow-lg"
        onClick={onBack}
      >
        Back to Main Menu
      </button>
    </div>
  );
};

export default HangarScreen;
