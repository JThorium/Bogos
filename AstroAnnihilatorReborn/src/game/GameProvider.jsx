<<<<<<< HEAD
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
=======
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
import { ufos } from './UFOData'; // Import UFO data
import { auth, subscribeAuth, db } from '../services/firebase';
import { doc, setDoc, getDoc, query, collection, orderBy, limit, getDocs } from 'firebase/firestore';

const GameContext = createContext();

<<<<<<< HEAD
// Helper to post score
async function postScore(uid, displayName, score, avatarUrl) {
  if (!uid) return;
  const userRef = doc(db, 'leaderboard', uid);
  const prev = await getDoc(userRef);
  if (!prev.exists() || prev.data().score < score) {
    await setDoc(userRef, { displayName, score, timestamp: Date.now(), avatarUrl });
  }
}

export async function fetchTopScores(count = 10) {
  const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(() => {
    // Initialize from localStorage
    const savedStarCredits = parseInt(localStorage.getItem('starCredits') || '0');
    const savedUnlockedUFOIds = new Set(JSON.parse(localStorage.getItem('unlockedUFOIds') || '["interceptor"]'));
    const savedHasPurchasedScoreBoost = JSON.parse(localStorage.getItem('hasPurchasedScoreBoost') || 'false');
    const savedSpawnMultiplier = parseInt(localStorage.getItem('spawnMultiplier') || '1');
    const selectedUFOId = localStorage.getItem('selectedUFOId') || 'interceptor';
    // Ensure 'interceptor' is always unlocked
    savedUnlockedUFOIds.add('interceptor');
=======
// Safe localStorage helper
const safeGetLocalStorage = (key, defaultValue) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key) || defaultValue;
    }
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
  return defaultValue;
};

const safeParseJSON = (str, defaultValue) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('JSON parse error:', error);
    return defaultValue;
  }
};

const safeSetLocalStorage = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn('localStorage setItem failed:', error);
  }
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(() => {
    // Initialize from localStorage with safety checks
    const savedStarCredits = parseInt(safeGetLocalStorage('starCredits', '0'));
    const savedUnlockedUFOIds = new Set(safeParseJSON(safeGetLocalStorage('unlockedUFOIds', '["scout"]'), ['scout']));
    const savedHasPurchasedScoreBoost = safeParseJSON(safeGetLocalStorage('hasPurchasedScoreBoost', 'false'), false);
    const savedSpawnMultiplier = parseInt(safeGetLocalStorage('spawnMultiplier', '1'));
    const selectedUFOId = safeGetLocalStorage('selectedUFOId', 'scout');
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
    const initialUFO = ufos.find(ufo => ufo.id === selectedUFOId);
    
    return {
      currentScreen: 'mainMenu', // 'mainMenu', 'playing', 'options', 'leaderboard', 'gameOver', 'hangar'
      score: 0,
      highScore: parseInt(localStorage.getItem('highScore') || '0'),
      playerHealth: initialUFO ? initialUFO.stats.health : 3,
      playerShield: initialUFO ? (initialUFO.id === 'sentinel' ? 1 : 0) : 0, // Initial shield based on Sentinel
      playerBombs: 0, // Initial bombs
      starCredits: savedStarCredits, // Initial credits from localStorage
      rawMaterials: parseInt(safeGetLocalStorage('rawMaterials', '0')),
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
      gameMode: safeGetLocalStorage('gameMode', 'classic'),
      fusionConfig: safeParseJSON(safeGetLocalStorage('fusionConfig', '[]'), []),
      isCombineAllActive: safeParseJSON(safeGetLocalStorage('isCombineAllActive', 'false'), false),
      upgrades: safeParseJSON(safeGetLocalStorage('upgrades', JSON.stringify({
        startShield: { level: 0, maxLevel: 10, cost: 100, costIncrease: 150, matCost: 1, matIncrease: 1, name: "Start Shield" },
        startMinion: { level: 0, maxLevel: 10, cost: 500, costIncrease: 500, matCost: 5, matIncrease: 2, name: "Start Minion" },
        fireRate: { level: 0, maxLevel: 10, cost: 250, costIncrease: 250, matCost: 2, matIncrease: 2, name: "Fire Rate" },
        startBomb: { level: 0, maxLevel: 10, cost: 750, costIncrease: 750, matCost: 3, matIncrease: 1, name: "Start Bomb" },
        powerupDuration: { level: 0, maxLevel: 10, cost: 400, costIncrease: 400, matCost: 2, matIncrease: 1, name: "Powerup Duration" },
        creditBonus: { level: 0, maxLevel: 10, cost: 1000, costIncrease: 1000, matCost: 10, matIncrease: 5, name: "Credit Bonus" }
      })), {
        startShield: { level: 0, maxLevel: 10, cost: 100, costIncrease: 150, matCost: 1, matIncrease: 1, name: "Start Shield" },
        startMinion: { level: 0, maxLevel: 10, cost: 500, costIncrease: 500, matCost: 5, matIncrease: 2, name: "Start Minion" },
        fireRate: { level: 0, maxLevel: 10, cost: 250, costIncrease: 250, matCost: 2, matIncrease: 2, name: "Fire Rate" },
        startBomb: { level: 0, maxLevel: 10, cost: 750, costIncrease: 750, matCost: 3, matIncrease: 1, name: "Start Bomb" },
        powerupDuration: { level: 0, maxLevel: 10, cost: 400, costIncrease: 400, matCost: 2, matIncrease: 1, name: "Powerup Duration" },
        creditBonus: { level: 0, maxLevel: 10, cost: 1000, costIncrease: 1000, matCost: 10, matIncrease: 5, name: "Credit Bonus" }
      }),
      shopCosts: { shield: 75, bomb: 125, minion: 200, health: 150 }, // In-game shop costs
    };
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = subscribeAuth(setUser);
    return unsub;
  }, []);

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
      
      // Save relevant states to localStorage safely
      safeSetLocalStorage('highScore', newState.highScore.toString());
      safeSetLocalStorage('starCredits', newState.starCredits.toString());
      safeSetLocalStorage('rawMaterials', newState.rawMaterials.toString());
      safeSetLocalStorage('hasPurchasedScoreBoost', JSON.stringify(newState.hasPurchasedScoreBoost));
      safeSetLocalStorage('spawnMultiplier', newState.spawnMultiplier.toString());
      safeSetLocalStorage('selectedUFOId', newState.selectedUFOId);
      safeSetLocalStorage('unlockedUFOIds', JSON.stringify(Array.from(newState.unlockedUFOIds)));
      safeSetLocalStorage('gameMode', newState.gameMode);
      safeSetLocalStorage('fusionConfig', JSON.stringify(newState.fusionConfig));
      safeSetLocalStorage('isCombineAllActive', JSON.stringify(newState.isCombineAllActive));
      safeSetLocalStorage('upgrades', JSON.stringify(newState.upgrades));

      return newState;
    });
  };

  // Derive current UFO data based on selectedUFOId
  const currentUFO = useMemo(() => {
    return ufos.find(ufo => ufo.id === gameState.selectedUFOId);
  }, [gameState.selectedUFOId]);

  // Function to select a UFO
<<<<<<< HEAD
  const selectUFO = (ufoId) => {
    if (ufoId === 'interceptor' || gameState.unlockedUFOIds.has(ufoId)) {
=======
  const selectUFO = useCallback((ufoId) => {
    if (gameState.unlockedUFOIds.has(ufoId)) {
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
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
  }, [gameState.unlockedUFOIds, updateGameState]);

  // Function to unlock a UFO
  const unlockUFO = useCallback((ufoId, cost) => {
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
      // console.log(`UFO ${ufoId} unlocked for ${cost} credits!`);
      return true;
    } else {
      console.warn(`Not enough credits to unlock UFO ${ufoId}. Needed: ${cost}, Have: ${gameState.starCredits}`);
      return false;
    }
  }, [gameState.unlockedUFOIds, gameState.starCredits, updateGameState]);

  const contextValue = useMemo(() => ({
    gameState,
    updateGameState,
    currentUFO,
    selectUFO,
    unlockUFO,
<<<<<<< HEAD
    user,
    postScore,
  }), [gameState, currentUFO, selectUFO, unlockUFO, user, postScore]); // Include functions in dependencies
=======
  }), [gameState, currentUFO, selectUFO, unlockUFO]);
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};
