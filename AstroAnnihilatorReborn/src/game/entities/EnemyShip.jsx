import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameEntity from './GameEntity';
import { ufos } from '../UFOData';
import * as THREE from 'three';

// Function to invert RGB colors (assuming colors are 0-1 range)
const invertColors = (colors) => {
  if (!colors || colors.length < 3) return [1, 1, 1]; // Default to white if no colors
  // Invert the first three components (R, G, B)
  return [1 - colors[0], 1 - colors[1], 1 - colors[2]];
};

function EnemyShip({ position }) {
  const mesh = useRef();

  // Get enemy UFO data (e.g., 'ufo4' for now)
  const enemyUfoData = ufos.find(ufo => ufo.id === 'ufo4');
  const invertedColorsArray = invertColors(enemyUfoData.colors);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y -= 0.05; // Move enemy downwards

      // Calculate angle towards player's X position (for Y-axis rotation)
      // Assuming player is generally at x=0 (center of the screen)
      const playerX = state.mouse.x * (state.viewport.width / 2); // Get player's current X in world coords
      const angleToPlayerX = Math.atan2(playerX - mesh.current.position.x, 0); // Angle based on X difference

      // Y-axis rotation: angle towards player's X position
      // This will make their "side" face the player
      mesh.current.rotation.y = angleToPlayerX;

      // X-axis "lean" forward/back based on Y position
      const viewportHeight = state.viewport.height;
      const topOfScreen = viewportHeight / 2;
      const bottomOfScreen = -viewportHeight / 2;
      
      // Normalize Y position from top to bottom (0 to 1)
      const normalizedY = (topOfScreen - mesh.current.position.y) / (topOfScreen - bottomOfScreen);

      // Implement lean: lean forward (positive X rotation) in first half, lean back (negative X rotation) in second half
      // Max lean angle (e.g., 30 degrees or PI/6 radians)
      const maxLeanAngle = Math.PI / 6; 

      if (normalizedY < 0.5) {
        // First half: lean from 0 to maxLeanAngle
        mesh.current.rotation.x = maxLeanAngle * (normalizedY / 0.5);
      } else {
        // Second half: lean from maxLeanAngle back to 0
        mesh.current.rotation.x = maxLeanAngle * (1 - (normalizedY - 0.5) / 0.5);
      }

      // No Z-axis rotation
      mesh.current.rotation.z = 0;

      if (mesh.current.position.y < -10) {
        // Reset enemy position if it goes off screen
        mesh.current.position.y = 10;
        mesh.current.position.x = (Math.random() - 0.5) * 8;
      }
    }
  });

  return (
    <GameEntity 
      ref={mesh} 
      geometry={enemyUfoData.geometry}
      colors={invertedColorsArray} 
      position={position} 
      enableRotation={false} 
    />
  );
}

export default EnemyShip;
