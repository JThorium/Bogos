import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import GameEntity from './GameEntity';

function EnemyShip({ position }) {
  const mesh = useRef();

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
    <GameEntity ref={mesh} position={position} color="red" shape="sphere" args={[0.4, 0.4, 0.4]} enableRotation={true} /> {/* Changed size to match player */}
  );
}

export default EnemyShip;
