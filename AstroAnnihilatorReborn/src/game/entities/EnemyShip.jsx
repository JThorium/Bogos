import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import GameEntity from './GameEntity';
import { ufos } from '../UFOData';
import * as THREE from 'three';

// Function to invert RGB colors (assuming colors are 0-1 range)
const invertColors = (colors) => {
  if (!colors || colors.length < 3) return [1, 1, 1]; // Default to white if no colors
  // Invert the first three components (R, G, B)
  return [1 - colors[0], 1 - colors[1], 1 - colors[2]];
};

function EnemyShip({ position, ufoData }) { // Accept ufoData prop
  const mesh = useRef();
  const { viewport } = useThree(); // Use useThree to get viewport for rotation logic

  // Use ufoData prop directly, fall back to a default if not provided
  const effectiveUfoData = ufoData || ufos.find(ufo => ufo.id === 'ufo4'); 
  const invertedColorsArray = invertColors(effectiveUfoData.colors);

  useFrame((state) => {
    if (mesh.current) {
      // Calculate angle towards player's X position (for Y-axis rotation)
      // Assuming player is generally at x=0 (center of the screen)
      const playerX = state.mouse.x * (viewport.width / 2); // Get player's current X in world coords
      const angleToPlayerX = Math.atan2(playerX - mesh.current.position.x, 0); // Angle based on X difference

      // Y-axis rotation: angle towards player's X position
      // This will make their "side" face the player
      mesh.current.rotation.y = angleToPlayerX;

      // X-axis "lean" forward/back based on Y position
      const viewportHeight = viewport.height;
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
    }
  });

  return (
    <GameEntity 
      ref={mesh} 
      geometry={effectiveUfoData.geometry}
      colors={invertedColorsArray} 
      position={position} 
      enableRotation={false} 
    />
  );
}

export default EnemyShip;
