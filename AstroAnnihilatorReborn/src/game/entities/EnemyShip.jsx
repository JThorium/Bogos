import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameEntity from './GameEntity';
import { ufos } from '../UFOData';
import * as THREE from 'three'; // Not directly needed here, but kept for consistency

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
  const invertedColorsArray = invertColors(enemyUfoData.colors); // Get inverted colors as array

  useFrame(() => {
    if (mesh.current) {
      mesh.current.position.y -= 0.05; // Move enemy downwards
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
      colors={invertedColorsArray} // Pass inverted colors array
      position={position} 
      enableRotation={false} // Disable tumbling for enemies
    />
  );
}

export default EnemyShip;
