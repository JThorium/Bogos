import React, { createContext, useState, useContext, useMemo } from 'react';
import { UFO_TYPES, DEFAULT_PLAYER_UFO_ID } from './UFOData'; // Import UFO_TYPES and DEFAULT_PLAYER_UFO_ID

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(() => {
    // Initialize from localStorage
    const savedStarCredits = parseInt(localStorage.getItem('starCredits') || '0');
    // Ensure unlockedUFOIds correctly initializes with DEFAULT_PLAYER_UFO_ID if localStorage is empty
    const defaultUnlocked = [DEFAULT_PLAYER_UFO_ID];
    const savedUnlockedUFOIds = new Set(JSON.parse(localStorage.getItem('unlockedUFOIds') || JSON.stringify(defaultUnlocked)));
    const savedHasPurchasedScoreBoost = JSON.parse(localStorage.getItem('hasPurchasedScoreBoost') || 'false');
    const savedSpawnMultiplier = parseInt(localStorage.getItem('spawnMultiplier') || '1');
    // Use DEFAULT_PLAYER_UFO_ID from UFOData.js
    const selectedUFOId = localStorage.getItem('selectedUFOId') || DEFAULT_PLAYER_UFO_ID;
    const initialUFO = UFO_TYPES[selectedUFOId] || UFO_TYPES[DEFAULT_PLAYER_UFO_ID]; // Fallback to default if selected is invalid
    
    return {
      currentScreen: 'mainMenu', // 'mainMenu', 'playing', 'options', 'leaderboard', 'gameOver', 'hangar'
      score: 0,
      highScore: parseInt(localStorage.getItem('highScore') || '0'),
      playerHealth: initialUFO.stats.health,
      // Use shield from stats or default for sentinel. Ensure stats.shield is checked.
      playerShield: initialUFO.id === 'sentinel' ? (initialUFO.stats.shield !== undefined ? initialUFO.stats.shield : 1) : (initialUFO.stats.shield !== undefined ? initialUFO.stats.shield : 0),
      playerBombs: initialUFO.stats.startBombs || 0, // Assuming stats might have startBombs from UFOData
      starCredits: savedStarCredits,
      rawMaterials: parseInt(localStorage.getItem('rawMaterials') || '0'),
      materialsThisRun: 0,
      hasPurchasedScoreBoost: savedHasPurchasedScoreBoost, // Score boost state
      spawnMultiplier: savedSpawnMultiplier, // Challenge mode spawn multiplier
      selectedUFOId: selectedUFOId, // Default selected UFO from localStorage
      unlockedUFOIds: savedUnlockedUFOIds, // Default unlocked UFOs from localStorage
      gameFrame: 0,
      waveCount: 0,
      waveCredits: 0,
      isGameOver: false,
      scoreMultiplier: 1,
      gameMode: localStorage.getItem('gameMode') || 'classic',
      fusionConfig: JSON.parse(localStorage.getItem('fusionConfig') || '[]'),
      isCombineAllActive: JSON.parse(localStorage.getItem('isCombineAllActive') || 'false'),
      upgrades: JSON.parse(localStorage.getItem('upgrades') || JSON.stringify({
        startShield: { level: 0, maxLevel: 10, cost: 100, costIncrease: 150, matCost: 1, matIncrease: 1, name: "Start Shield" },
        startMinion: { level: 0, maxLevel: 10, cost: 500, costIncrease: 500, matCost: 5, matIncrease: 2, name: "Start Minion" },
        fireRate: { level: 0, maxLevel: 10, cost: 250, costIncrease: 250, matCost: 2, matIncrease: 2, name: "Fire Rate" },
        startBomb: { level: 0, maxLevel: 10, cost: 750, costIncrease: 750, matCost: 3, matIncrease: 1, name: "Start Bomb" },
        powerupDuration: { level: 0, maxLevel: 10, cost: 400, costIncrease: 400, matCost: 2, matIncrease: 1, name: "Powerup Duration" },
        creditBonus: { level: 0, maxLevel: 10, cost: 1000, costIncrease: 1000, matCost: 10, matIncrease: 5, name: "Credit Bonus" }
      })),
      shopCosts: { shield: 75, bomb: 125, minion: 200, health: 150 }, // In-game shop costs
    };
  });

  const updateGameState = (updates) => {
    setGameState((prev) => {
      const newState = { ...prev, ...updates };
      
      // Handle Set updates for unlockedUFOIds
      if (updates.unlockedUFOIds instanceof Set) {
        newState.unlockedUFOIds = new Set(updates.unlockedUFOIds);
      } else if (prev.unlockedUFOIds instanceof Set && updates.unlockedUFOIds === undefined) {
        newState.unlockedUFOIds = new Set(prev.unlockedUFOIds);
      }

      // Handle object updates for upgrades
      if (updates.upgrades) {
        newState.upgrades = { ...prev.upgrades, ...updates.upgrades };
      } else if (prev.upgrades && updates.upgrades === undefined) {
        newState.upgrades = { ...prev.upgrades };
      }
      
      // Save relevant states to localStorage
      localStorage.setItem('highScore', newState.highScore.toString());
      localStorage.setItem('starCredits', newState.starCredits.toString());
      localStorage.setItem('rawMaterials', newState.rawMaterials.toString());
      localStorage.setItem('hasPurchasedScoreBoost', JSON.stringify(newState.hasPurchasedScoreBoost));
      localStorage.setItem('spawnMultiplier', newState.spawnMultiplier.toString());
      localStorage.setItem('selectedUFOId', newState.selectedUFOId);
      localStorage.setItem('unlockedUFOIds', JSON.stringify(Array.from(newState.unlockedUFOIds)));
      localStorage.setItem('gameMode', newState.gameMode);
      localStorage.setItem('fusionConfig', JSON.stringify(newState.fusionConfig));
      localStorage.setItem('isCombineAllActive', JSON.stringify(newState.isCombineAllActive));
      localStorage.setItem('upgrades', JSON.stringify(newState.upgrades));

      return newState;
    });
  };

  // Derive current UFO data based on selectedUFOId
  const currentUFO = useMemo(() => {
    return UFO_TYPES[gameState.selectedUFOId] || UFO_TYPES[DEFAULT_PLAYER_UFO_ID];
  }, [gameState.selectedUFOId]);

  // Function to select a UFO
  const selectUFO = (ufoId) => {
    if (gameState.unlockedUFOIds.has(ufoId)) {
      const newUFO = UFO_TYPES[ufoId];
      if (newUFO) {
        updateGameState({ 
          selectedUFOId: ufoId,
          playerHealth: newUFO.stats.health,
          playerShield: newUFO.id === 'sentinel' ? (newUFO.stats.shield !== undefined ? newUFO.stats.shield : 1) : (newUFO.stats.shield !== undefined ? newUFO.stats.shield : 0),
          playerBombs: newUFO.stats.startBombs || 0,
        });
      }
    } else {
      console.warn(`UFO ${ufoId} is not unlocked!`);
    }
  };

  // Function to unlock a UFO
  const unlockUFO = (ufoId, cost) => {
    const ufo = UFO_TYPES[ufoId];
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
