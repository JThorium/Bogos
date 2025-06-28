import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from '../../game/GameProvider';
import GameEntity from './GameEntity';
// import { ufos } from '../UFOData'; // No longer needed, comes from GameProvider
// import * as THREE from 'three'; // Not needed for this approach

function PlayerShip({ onShoot }) {
  const { gameState, updateGameState, currentUFO } = useGame(); // Get currentUFO from context
  const { size, viewport } = useThree();
  const [position, setPosition] = useState([0, 0, 0]);

  // Autofire cooldown now comes from currentUFO stats
  const shootCooldown = currentUFO ? currentUFO.stats.shotCooldown : 0.2; 
  const lastShootTime = useRef(0);

  // Update initial position once viewport is ready
  useEffect(() => {
    if (size.height && gameState.currentScreen === 'mainMenu' && currentUFO) {
      // Position at the bottom center of the screen, using viewport dimensions
      // Use currentUFO's height for accurate positioning
      setPosition([0, -viewport.height / 2 + (currentUFO.geometry.parameters.height || 0.4) / 2, 0]);
    }
  }, [size.height, gameState.currentScreen, viewport.height, currentUFO]);

  const handleClick = (event) => {
    if (gameState.currentScreen === 'mainMenu') {
      updateGameState({ currentScreen: 'playing' });
      event.stopPropagation(); // Prevent clicks from propagating to canvas
    }
  };

  useFrame((state) => {
    if (gameState.currentScreen === 'playing' && currentUFO) { // Ensure currentUFO is available
      // Autofire logic
      if (state.clock.elapsedTime - lastShootTime.current > shootCooldown) {
        onShoot([position[0], position[1] + (currentUFO.geometry.parameters.height || 0.4) / 2 + 0.1, position[2]]); // Shoot from above player
        lastShootTime.current = state.clock.elapsedTime;
      }

      // Map normalized mouse coordinates (-1 to 1) to world coordinates directly.
      const x = state.mouse.x * (viewport.width / 2);
      const y = state.mouse.y * (viewport.height / 2);
      
      // Player size is now dynamic based on currentUFO
      const playerHalfSize = Math.max(currentUFO.geometry.parameters.radiusTop || 0, currentUFO.geometry.parameters.radiusBottom || 0, currentUFO.geometry.parameters.width / 2 || 0.2); 

      // Clamping to ensure player stays within screen bounds
      const clampedX = Math.max(-viewport.width / 2 + playerHalfSize, Math.min(viewport.width / 2 - playerHalfSize, x));
      const clampedY = Math.max(-viewport.height / 2 + playerHalfSize, Math.min(viewport.height / 2 - playerHalfSize, y));

      setPosition([clampedX, clampedY, 0]);
    }
  });

  if (!currentUFO) return null; // Don't render until currentUFO is loaded

  return (
    <GameEntity 
      geometry={currentUFO.geometry} // Pass geometry from currentUFO
      colors={currentUFO.colors} // Pass colors from currentUFO
      position={position} 
      onClick={handleClick}
    />
  );
}

export default PlayerShip;
