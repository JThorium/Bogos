import React from 'react';
import GameEntity from './GameEntity';

function BombPickup({ position, color }) {
  return (
    <GameEntity
      position={position}
      color={color}
      geometry={{ type: 'SphereGeometry', args: [0.3, 16, 16] }}
    />
  );
}

export default BombPickup;
