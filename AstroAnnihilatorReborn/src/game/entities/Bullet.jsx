import React, { useRef } from 'react';
import GameEntity from './GameEntity';
import * as THREE from 'three'; // Import THREE

function Bullet({ position, speed, damage = 1, color = 'yellow', firedByPlayer }) {
  const meshRef = useRef();

  return (
    <GameEntity ref={meshRef} position={new THREE.Vector3(...position)} color={color} geometry={{ type: 'BoxGeometry', args: [0.2, 0.5, 0.1] }} userData={{ firedByPlayer }} />
  );
}

export default Bullet;
