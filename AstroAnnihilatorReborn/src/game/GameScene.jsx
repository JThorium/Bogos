import React, { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from './GameProvider'; // Import useGame for score/health
import PlayerShip from './entities/PlayerShip';
import EnemyShip from './entities/EnemyShip';
import Bullet from './entities/Bullet';
import Starfield from './Starfield';
import { ufos } from './UFOData'; // Import ufos to select enemy types

function GameScene() {
  const { viewport } = useThree();
  const { gameState, updateGameState } = useGame(); // Use game state
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const lastSpawnTime = useRef(0);
  const spawnInterval = 1; // Spawn a new enemy every 1 second

  const addBullet = (bulletPosition) => {
    setBullets((prevBullets) => [
      ...prevBullets,
      { id: Date.now(), position: bulletPosition, speed: 0.5 }, // Add bullet speed
    ]);
  };

  useFrame((state) => {
    // Bullet movement and lifecycle
    setBullets((prevBullets) =>
      prevBullets
        .map((bullet) => ({
          ...bullet,
          position: [bullet.position[0], bullet.position[1] + bullet.speed, bullet.position[2]],
        }))
        .filter((bullet) => bullet.position[1] < viewport.height / 2 + 1)
    );

    // Enemy spawning logic
    if (state.clock.elapsedTime - lastSpawnTime.current > spawnInterval) {
      const enemyUfoOptions = ufos.filter(ufo => ufo.id !== gameState.selectedUFOId); // Don't spawn player's UFO
      const randomUfo = enemyUfoOptions[Math.floor(Math.random() * enemyUfoOptions.length)];

      const newEnemy = {
        id: Date.now(),
        position: [(Math.random() - 0.5) * (viewport.width - 2), viewport.height / 2 + 5, 0], // Spawn off-screen top
        ufoData: randomUfo, // Pass the selected UFO data
        speed: 0.05, // Enemy downward speed
        health: randomUfo.stats.health, // Initialize enemy health from ufoData
      };
      setEnemies((prevEnemies) => [...prevEnemies, newEnemy]);
      lastSpawnTime.current = state.clock.elapsedTime;
    }

    // Enemy movement
    setEnemies((prevEnemies) =>
      prevEnemies
        .map((enemy) => ({
          ...enemy,
          position: [enemy.position[0], enemy.position[1] - enemy.speed, enemy.position[2]],
        }))
        .filter((enemy) => enemy.position[1] > -viewport.height / 2 - 5) // Remove off-screen enemies
    );

    // Collision Detection (Player Bullet vs. Enemy)
    setEnemies((prevEnemies) => {
      const remainingEnemies = [];
      const newBullets = [];
      let scoreIncrease = 0;

      prevEnemies.forEach((enemy) => {
        let enemyHit = false;
        bullets.forEach((bullet) => {
          // Simple circular collision detection for now
          // Assuming a rough radius for UFOs and bullets
          const enemyRadius = 0.5; // Placeholder, refine with actual model size
          const bulletRadius = 0.1;

          const dx = enemy.position[0] - bullet.position[0];
          const dy = enemy.position[1] - bullet.position[1];
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < enemyRadius + bulletRadius) {
            // Collision!
            enemyHit = true;
            // Mark bullet for removal (don't add to newBullets)
          } else {
            newBullets.push(bullet);
          }
        });

        if (enemyHit) {
          // Enemy hit, reduce health or remove
          enemy.health -= 1; // Decrease health
          if (enemy.health <= 0) {
            scoreIncrease += 100; // Increase score for destroyed enemy
          } else {
            remainingEnemies.push(enemy); // Keep enemy if not destroyed
          }
        } else {
          remainingEnemies.push(enemy);
        }
      });

      if (scoreIncrease > 0) {
        updateGameState((prev) => ({ score: prev.score + scoreIncrease }));
      }
      setBullets(newBullets); // Update bullets after collision checks
      return remainingEnemies;
    });

    // Collision Detection (Player Ship vs. Enemy) - Basic for now
    const playerShipMesh = state.scene.children.find(obj => obj.userData.isPlayer); // Assuming PlayerShip marks itself
    if (playerShipMesh) {
      const playerRadius = 0.5; // Placeholder
      setEnemies((prevEnemies) => {
        return prevEnemies.filter((enemy) => {
          const enemyRadius = 0.5; // Placeholder
          const dx = playerShipMesh.position.x - enemy.position[0];
          const dy = playerShipMesh.position.y - enemy.position[1];
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < playerRadius + enemyRadius) {
            // Player hit by enemy!
            updateGameState((prev) => ({ playerHealth: prev.playerHealth - 1 }));
            return false; // Remove enemy on collision
          }
          return true;
        });
      });
    }
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
      <PlayerShip onShoot={addBullet} />

      {/* Render Bullets */}
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} position={bullet.position} />
      ))}

      {/* Render Enemies */}
      {enemies.map((enemy) => (
        <EnemyShip key={enemy.id} position={enemy.position} ufoData={enemy.ufoData} />
      ))}
    </>
  );
}

export default GameScene;
