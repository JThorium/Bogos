import React from 'react';
import GameEntity from './GameEntity';
import * as THREE from 'three'; // Import THREE

function BombPickup({ position, speed, color }) {
  return (
    <GameEntity
      position={position} // Pass position array directly
      color={color || 'red'}
      geometry={{ type: 'SphereGeometry', args: [0.3, 16, 16] }}
      enableRotation={true}
    />
  );
}

export default BombPickup;
