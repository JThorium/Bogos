import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from '../../game/GameProvider';
import GameEntity from './GameEntity';
import { ufos } from '../UFOData'; // Import UFO data
import * as THREE from 'three'; // Import THREE for Color

function PlayerShip({ onShoot }) {
  const { gameState, updateGameState } = useGame();
  const { size, viewport } = useThree();
  const [position, setPosition] = useState([0, 0, 0]);

  // Get player UFO data (e.g., 'scout' for now)
  const playerUfoData = ufos.find(ufo => ufo.id === 'scout');

  // Autofire cooldown
  const shootCooldown = 0.2; // seconds between shots (half speed)
  const lastShootTime = useRef(0);

  // Update initial position once viewport is ready
  useEffect(() => {
    if (size.height && gameState.currentScreen === 'mainMenu') {
      // Position at the bottom center of the screen, using viewport dimensions
      setPosition([0, -viewport.height / 2 + 0.4 / 2, 0]); // Player height is 0.4
    }
  }, [size.height, gameState.currentScreen, viewport.height, playerUfoData]);

  const handleClick = (event) => {
    if (gameState.currentScreen === 'mainMenu') {
      updateGameState({ currentScreen: 'playing' });
      event.stopPropagation(); // Prevent clicks from propagating to canvas
    }
  };

  useFrame((state) => {
    if (gameState.currentScreen === 'playing') {
      // Autofire logic
      if (state.clock.elapsedTime - lastShootTime.current > shootCooldown) {
        onShoot([position[0], position[1] + (playerUfoData.geometry.parameters.height || 0.4) / 2 + 0.1, position[2]]); // Shoot from above player
        lastShootTime.current = state.clock.elapsedTime;
      }

      // Map normalized mouse coordinates (-1 to 1) to world coordinates directly.
      const x = state.mouse.x * (viewport.width / 2);
      const y = state.mouse.y * (viewport.height / 2);
      
      // Player size is 0.4 units, so half size is 0.2
      const playerHalfSize = 0.2; // Fixed half size for clamping

      // Clamping to ensure player stays within screen bounds
      const clampedX = Math.max(-viewport.width / 2 + playerHalfSize, Math.min(viewport.width / 2 - playerHalfSize, x));
      const clampedY = Math.max(-viewport.height / 2 + playerHalfSize, Math.min(viewport.height / 2 - playerHalfSize, y));

      setPosition([clampedX, clampedY, 0]);
    }
  });

  return (
    <GameEntity 
      geometry={playerUfoData.geometry} // Pass geometry
      colors={playerUfoData.colors} // Pass colors
      position={position} 
      // args={[0.4, 0.4, 0.4]} // No longer needed as geometry is passed
      onClick={handleClick}
    />
  );
}

export default PlayerShip;
