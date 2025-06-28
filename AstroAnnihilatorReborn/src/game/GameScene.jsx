import React, { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber'; // Import useThree
import PlayerShip from './entities/PlayerShip';
import EnemyShip from './entities/EnemyShip';
import Bullet from './entities/Bullet';
import Starfield from './Starfield';

function GameScene() {
  const { viewport } = useThree(); // Get viewport for filtering bullets
  const [bullets, setBullets] = useState([]);

  const addBullet = (bulletPosition) => {
    setBullets((prevBullets) => [
      ...prevBullets,
      { id: Date.now(), position: bulletPosition },
    ]);
  };

  useFrame(() => {
    // Filter out bullets that are off-screen (above the viewport)
    setBullets((prevBullets) =>
      prevBullets.filter((bullet) => bullet.position[1] < viewport.height / 2 + 1) // Keep bullets that are below top boundary
    );
  });

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} />
      <pointLight position={[0, 0, 5]} intensity={0.5} />

      {/* Starfield Background */}
      <Starfield />

      {/* Player Ship */}
      <PlayerShip onShoot={addBullet} /> {/* Pass addBullet function to PlayerShip */}

      {/* Render Bullets */}
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} position={bullet.position} />
      ))}

      {/* Enemy Ships (example) */}
      <EnemyShip position={[2, 8, 0]} />
      <EnemyShip position={[-2, 10, 0]} />
      <EnemyShip position={[0, 12, 0]} />
      
      {/* Other 3D game elements will go here */}
    </>
  );
}

export default GameScene;
