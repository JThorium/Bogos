import React from 'react';
import { useFrame } from '@react-three/fiber';
import PlayerShip from './entities/PlayerShip';
import EnemyShip from './entities/EnemyShip'; // Import EnemyShip
import Starfield from './Starfield';

function GameScene() {
  // Placeholder for game scene logic
  useFrame(() => {
    // Game loop updates go here
  });

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.8} /> {/* Increased ambient light */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} /> {/* Increased spot light intensity */}
      <pointLight position={[-10, -10, -10]} intensity={0.8} /> {/* Increased point light intensity */}
      <pointLight position={[0, 0, 5]} intensity={0.5} /> {/* Added a light closer to the scene */}

      {/* Starfield Background */}
      <Starfield />

      {/* Player Ship */}
      <PlayerShip />

      {/* Enemy Ships (example) */}
      <EnemyShip position={[2, 8, 0]} /> {/* Spawn higher */}
      <EnemyShip position={[-2, 10, 0]} /> {/* Spawn higher */}
      <EnemyShip position={[0, 12, 0]} /> {/* Spawn higher */}
      
      {/* Other 3D game elements will go here */}
    </>
  );
}

export default GameScene;
