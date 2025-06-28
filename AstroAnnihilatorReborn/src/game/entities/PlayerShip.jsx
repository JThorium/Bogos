import React, { useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from '../../game/GameProvider';
import GameEntity from './GameEntity';

function PlayerShip() {
  const { gameState, updateGameState } = useGame();
  const { viewport } = useThree();
  const [position, setPosition] = useState([0, 0, 0]); // Initial default position

  // Update initial position once viewport is ready
  useEffect(() => {
    if (viewport.height && gameState.currentScreen === 'mainMenu') {
      // Position at the bottom center of the screen
      setPosition([0, -viewport.height / 2 + 1, 0]);
    }
  }, [viewport.height, gameState.currentScreen]);

  const handleClick = (event) => {
    if (gameState.currentScreen === 'mainMenu') {
      updateGameState({ currentScreen: 'playing' });
      event.stopPropagation(); // Prevent clicks from propagating to canvas
    }
  };

  useFrame((state) => {
    if (gameState.currentScreen === 'playing') {
      // Get normalized mouse coordinates (-1 to 1)
      const mouseX = state.mouse.x;
      const mouseY = state.mouse.y;

      // Map normalized mouse coordinates to viewport dimensions
      // This creates a direct 1:1 tracking within the visible game area
      // Directly use mouse coordinates as position, scaled by viewport dimensions
      // This should provide 1:1 tracking
      const x = mouseX * (viewport.width / 2);
      const y = mouseY * (viewport.height / 2);
      
      // Player size is 0.2 units, so half size is 0.1
      const playerHalfSize = 0.1; 

      // Clamping to ensure player stays within the visible viewport
      const clampedX = Math.max(-viewport.width / 2 + playerHalfSize, Math.min(viewport.width / 2 - playerHalfSize, x));
      const clampedY = Math.max(-viewport.height / 2 + playerHalfSize, Math.min(viewport.height / 2 - playerHalfSize, y));

      setPosition([clampedX, clampedY, 0]); // Always keep player at Z=0
    }
  });

  return (
    <GameEntity 
      color="cyan" 
      position={position} 
      args={[0.4, 0.4, 0.4]} // Player size (twice the current size)
      onClick={handleClick}
    />
  );
}

export default PlayerShip;
