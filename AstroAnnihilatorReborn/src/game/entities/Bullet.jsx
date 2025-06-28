import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameEntity from './GameEntity';

function Bullet({ position, speed = 1.5, damage = 1, color = 'yellow' }) { // Increased default speed
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y += speed; // Move bullet upwards
      // TODO: Implement collision detection here
    }
  });

  return (
    <GameEntity ref={meshRef} position={position} color={color} shape="box" args={[0.2, 0.5, 0.1]} /> // Increased size
  );
}

export default Bullet;
