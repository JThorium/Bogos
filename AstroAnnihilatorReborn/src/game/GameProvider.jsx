import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    currentScreen: 'mainMenu', // 'mainMenu', 'playing', 'options', 'leaderboard', 'gameOver'
    score: 0,
    playerHealth: 3,
    // Add other relevant game state variables here
  });

  const updateGameState = (updates) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <GameContext.Provider value={{ gameState, updateGameState }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};
