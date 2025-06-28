import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameEntity from './GameEntity';

function Bullet({ position, speed, damage = 1, color = 'yellow', firedByPlayer }) {
  const meshRef = useRef();

  return (
    <GameEntity ref={meshRef} position={position} color={color} geometry={{ type: 'BoxGeometry', args: [0.2, 0.5, 0.1] }} userData={{ firedByPlayer }} />
  );
}

export default Bullet;
