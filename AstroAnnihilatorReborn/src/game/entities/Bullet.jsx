import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameEntity from './GameEntity';

function Bullet({ position, speed = 1.5, damage = 1, color = 'yellow', firedByPlayer }) { // Increased default speed
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y += speed; // Move bullet upwards
      // TODO: Implement collision detection here
    }
  });

  return (
    <GameEntity ref={meshRef} position={position} color={color} geometry={{ type: 'BoxGeometry', args: [0.2, 0.5, 0.1] }} userData={{ firedByPlayer }} /> // Increased size, pass geometry object
  );
}

export default Bullet;
