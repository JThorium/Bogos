import React, { useState } from 'react';
import { useGame } from '../game/GameProvider';
import { ufos } from '../game/UFOData';
import UFOPreview from './UFOPreview';

const FusionLabModal = ({ open, onClose, ufos, unlockedUFOIds, fusionConfig, isCombineAllActive, updateGameState }) => {
  if (!open) return null;
  const slotsUnlocked = 5; // For now, always allow 5 slots (can be dynamic)
  const canActivateChimera = unlockedUFOIds.size >= 5;
  const handleAddToFusion = (ufoId) => {
    if (fusionConfig.includes(ufoId) || fusionConfig.length >= slotsUnlocked) return;
    updateGameState(prev => ({
      fusionConfig: [...prev.fusionConfig, ufoId],
      gameMode: 'fusion',
      isCombineAllActive: false,
    }));
  };
  const handleRemoveFromFusion = (ufoId) => {
    updateGameState(prev => ({
      fusionConfig: prev.fusionConfig.filter(id => id !== ufoId),
      isCombineAllActive: false,
    }));
  };
  const handleClearFusion = () => {
    updateGameState(prev => ({
      fusionConfig: [],
      isCombineAllActive: false,
      gameMode: 'classic',
    }));
  };
  const handleActivateChimera = () => {
    updateGameState(prev => ({
      fusionConfig: [],
      isCombineAllActive: true,
      gameMode: 'fusion',
    }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-white text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-indigo-400">Fusion Lab</h2>
        <div className="mb-4">
          <div className="flex flex-row space-x-2 mb-2">
            {Array.from({ length: slotsUnlocked }).map((_, i) => {
              const ufoId = fusionConfig[i];
              const ufo = ufos.find(u => u.id === ufoId);
              return (
                <div key={i} className={`w-24 h-24 border-2 rounded-lg flex items-center justify-center ${ufo ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 bg-gray-800'}`}>
                  {ufo ? (
                    <div className="flex flex-col items-center">
                      <UFOPreview ufoData={ufo} />
                      <span className="text-xs mt-1">{ufo.name}</span>
                      <button className="text-xs text-red-400 mt-1" onClick={() => handleRemoveFromFusion(ufoId)}>Remove</button>
                    </div>
                  ) : (
                    <span className="text-gray-500">Empty</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {ufos.filter(u => u.id !== 'omega' && unlockedUFOIds.has(u.id)).map(ufo => (
              <button
                key={ufo.id}
                className={`py-1 px-2 rounded-lg text-xs font-bold ${fusionConfig.includes(ufo.id) ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                onClick={() => handleAddToFusion(ufo.id)}
                disabled={fusionConfig.includes(ufo.id) || fusionConfig.length >= slotsUnlocked}
              >
                {ufo.name}
              </button>
            ))}
          </div>
          <div className="flex space-x-2 mt-2">
            <button className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold" onClick={handleClearFusion}>Clear Fusion</button>
            <button className={`py-1 px-3 ${canActivateChimera ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 cursor-not-allowed'} text-black rounded-lg text-sm font-bold`} onClick={handleActivateChimera} disabled={!canActivateChimera}>Activate Chimera</button>
          </div>
          {isCombineAllActive && <div className="mt-2 text-yellow-400 font-bold">Chimera Mode Active!</div>}
        </div>
      </div>
    </div>
  );
};

const HangarScreen = ({ onBack }) => {
  const { gameState, selectUFO, unlockUFO, updateGameState } = useGame();
  const { selectedUFOId, unlockedUFOIds, starCredits, hasPurchasedScoreBoost, spawnMultiplier, fusionConfig, isCombineAllActive } = gameState;
  const [fusionLabOpen, setFusionLabOpen] = useState(false);

  // Score Boost Logic
  const scoreBoostCost = 1000;
  const handlePurchaseScoreBoost = () => {
    if (starCredits >= scoreBoostCost && !hasPurchasedScoreBoost) {
      updateGameState((prev) => ({
        starCredits: prev.starCredits - scoreBoostCost,
        hasPurchasedScoreBoost: true,
      }));
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
    }
  };

  // Fusion Lab Logic (Placeholder for now)
  const handleFusionLabClick = () => {
    setFusionLabOpen(true);
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
              const isUnlocked = ufo.id === 'interceptor' ? true : unlockedUFOIds.has(ufo.id);
              const isSelected = selectedUFOId === ufo.id;
              const canAfford = starCredits >= ufo.cost;

              return (
                <div 
                  key={ufo.id} 
                  className={`flex-shrink-0 w-96 border-2 p-2 rounded-lg text-center ${isSelected ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 bg-gray-800'} ${!isUnlocked ? 'opacity-50' : ''}`}> {/* Adjusted padding */}
                  <h3 className="text-base font-bold whitespace-normal" style={{ color: ufo.colors && ufo.colors.length >= 3 ? `rgb(${ufo.colors[0]*255},${ufo.colors[1]*255},${ufo.colors[2]*255})` : 'white' }}>{ufo.name}</h3> {/* Adjusted font-size */}
                  <p className="text-xs text-gray-300 mb-1">{ufo.ability || 'No ability listed'}</p> {/* Adjusted font-size and margin-bottom */}
                  {/* Interceptor is always unlocked and cannot be purchased */}
                  {ufo.id !== 'interceptor' && !isUnlocked ? (
                    <div className="mt-2"> {/* Adjusted margin-top */}
                      <p className="text-xs text-red-400 mb-1"> {/* Adjusted font-size and margin-bottom */}
                        {ufo.unlockMethod === 'score' ? `Unlock at ${ufo.unlockScore?.toLocaleString?.() || ''} pts` : `Cost: ${ufo.cost?.toLocaleString?.() || ''} CR`}
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
        className="mt-2 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg text-lg transition-colors duration-200 shadow-lg"
        onClick={onBack}
      >
        Back to Main Menu
      </button>

      <FusionLabModal
        open={fusionLabOpen}
        onClose={() => setFusionLabOpen(false)}
        ufos={ufos}
        unlockedUFOIds={unlockedUFOIds}
        fusionConfig={fusionConfig}
        isCombineAllActive={isCombineAllActive}
        updateGameState={updateGameState}
      />
    </div>
  );
};

export default HangarScreen;
