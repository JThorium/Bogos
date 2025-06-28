import React, { createContext, useState, useContext, useMemo } from 'react';
import { ufos } from './UFOData'; // Import UFO data

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(() => {
    // Initialize from localStorage
    const savedStarCredits = parseInt(localStorage.getItem('starCredits') || '0');
    const savedUnlockedUFOIds = new Set(JSON.parse(localStorage.getItem('unlockedUFOIds') || '["scout"]'));
    const savedHasPurchasedScoreBoost = JSON.parse(localStorage.getItem('hasPurchasedScoreBoost') || 'false');
    const savedSpawnMultiplier = parseInt(localStorage.getItem('spawnMultiplier') || '1');
    const selectedUFOId = localStorage.getItem('selectedUFOId') || 'scout';
    const initialUFO = ufos.find(ufo => ufo.id === selectedUFOId);
    
    return {
      currentScreen: 'mainMenu', // 'mainMenu', 'playing', 'options', 'leaderboard', 'gameOver', 'hangar'
      score: 0,
      playerHealth: initialUFO ? initialUFO.stats.health : 3,
      starCredits: savedStarCredits, // Initial credits from localStorage
      selectedUFOId: selectedUFOId, // Default selected UFO from localStorage
      unlockedUFOIds: savedUnlockedUFOIds, // Default unlocked UFOs from localStorage
      hasPurchasedScoreBoost: savedHasPurchasedScoreBoost, // Score boost state
      spawnMultiplier: savedSpawnMultiplier, // Challenge mode spawn multiplier
    };
  });

  const updateGameState = (updates) => {
    setGameState((prev) => {
      const newState = { ...prev, ...updates };
      // Handle Set updates if necessary
      if (updates.unlockedUFOIds instanceof Set) {
        newState.unlockedUFOIds = new Set(updates.unlockedUFOIds);
      }
      
      // Save relevant states to localStorage
      localStorage.setItem('starCredits', newState.starCredits.toString());
      localStorage.setItem('selectedUFOId', newState.selectedUFOId);
      localStorage.setItem('unlockedUFOIds', JSON.stringify(Array.from(newState.unlockedUFOIds)));
      localStorage.setItem('hasPurchasedScoreBoost', JSON.stringify(newState.hasPurchasedScoreBoost));
      localStorage.setItem('spawnMultiplier', newState.spawnMultiplier.toString());

      return newState;
    });
  };

  // Derive current UFO data based on selectedUFOId
  const currentUFO = useMemo(() => {
    return ufos.find(ufo => ufo.id === gameState.selectedUFOId);
  }, [gameState.selectedUFOId]);

  // Function to select a UFO
  const selectUFO = (ufoId) => {
    if (gameState.unlockedUFOIds.has(ufoId)) {
      const newUFO = ufos.find(ufo => ufo.id === ufoId);
      if (newUFO) {
        updateGameState({ 
          selectedUFOId: ufoId,
          playerHealth: newUFO.stats.health 
        });
      }
    } else {
      console.warn(`UFO ${ufoId} is not unlocked!`);
    }
  };

  // Function to unlock a UFO
  const unlockUFO = (ufoId, cost) => {
    const ufo = ufos.find(u => u.id === ufoId);
    if (!ufo) {
      console.error(`UFO with ID ${ufoId} not found.`);
      return false;
    }
    if (gameState.unlockedUFOIds.has(ufo.id)) {
      console.warn(`UFO ${ufoId} is already unlocked.`);
      return false;
    }
    if (gameState.starCredits >= cost) {
      updateGameState((prev) => ({
        starCredits: prev.starCredits - cost,
        unlockedUFOIds: new Set(prev.unlockedUFOIds).add(ufoId),
      }));
      console.log(`UFO ${ufoId} unlocked for ${cost} credits!`);
      return true;
    } else {
      console.warn(`Not enough credits to unlock UFO ${ufoId}. Needed: ${cost}, Have: ${gameState.starCredits}`);
      return false;
    }
  };

  const contextValue = useMemo(() => ({
    gameState,
    updateGameState,
    currentUFO,
    selectUFO,
    unlockUFO,
  }), [gameState, currentUFO, selectUFO, unlockUFO]); // Include functions in dependencies

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};
