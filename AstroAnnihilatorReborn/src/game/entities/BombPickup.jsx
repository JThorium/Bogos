import React from 'react';
import GameEntity from './GameEntity';
import * as THREE from 'three'; // Import THREE

function BombPickup({ position, speed, color }) {
  return (
    <GameEntity
      position={new THREE.Vector3(...position)} // Explicitly create Vector3
      color={color}
      geometry={{ type: 'SphereGeometry', args: [0.3, 16, 16] }}
    />
  );
}

export default BombPickup;
