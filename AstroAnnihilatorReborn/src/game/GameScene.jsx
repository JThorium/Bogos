import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { useGame } from './GameProvider';
import PlayerShip from './entities/PlayerShip';
import EnemyShip from './entities/EnemyShip';
import Bullet from './entities/Bullet';
import Starfield from './Starfield';
import { ufos } from './UFOData';

function GameScene() {
  const { viewport } = useThree();
  const { gameState, updateGameState } = useGame();
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [isShooting, setIsShooting] = useState(false);
  const lastSpawnTime = useRef(0);
  const spawnInterval = 1;
  const playerRef = useRef();

  useEffect(() => {
    const handleMouseDown = () => setIsShooting(true);
    const handleMouseUp = () => setIsShooting(false);
    window.addEventListener('pointerdown', handleMouseDown);
    window.addEventListener('pointerup', handleMouseUp);
    return () => {
      window.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, []);

  const addBullet = useCallback((bulletPosition) => {
    setBullets((prevBullets) => [
      ...prevBullets,
      { id: Date.now(), position: bulletPosition, speed: 1.5, firedByPlayer: true },
    ]);
  }, []);

  useFrame((state) => {
    if (gameState.currentScreen !== 'playing') return;

    // Move Bullets
    let updatedBullets = bullets.map(b => ({ ...b, position: [b.position[0], b.position[1] + b.speed, b.position[2]] })).filter(b => b.position[1] < viewport.height / 2);
    
    // Move Enemies
    let updatedEnemies = enemies.map(e => ({ ...e, position: [e.position[0], e.position[1] - e.speed, e.position[2]] })).filter(e => e.position[1] > -viewport.height / 2 - 5);

    // Spawn Enemies
    if (state.clock.elapsedTime - lastSpawnTime.current > spawnInterval) {
      const enemyUfoOptions = ufos.filter((ufo) => ufo.id !== gameState.selectedUFOId);
      const randomUfo = enemyUfoOptions[Math.floor(Math.random() * enemyUfoOptions.length)];
      const newEnemy = {
        id: Date.now(),
        position: [(Math.random() - 0.5) * (viewport.width - 2), viewport.height / 2 + 5, 0],
        ufoData: randomUfo,
        speed: 0.05,
        health: randomUfo.stats.health,
      };
      updatedEnemies.push(newEnemy);
      lastSpawnTime.current = state.clock.elapsedTime;
    }

    // Collision Detection
    const bulletsToRemove = new Set();
    const enemiesToRemove = new Set();
    let scoreToAdd = 0;
    let healthToLose = 0;

    // Bullet-Enemy Collision
    for (const bullet of updatedBullets) {
        if (!bullet.firedByPlayer) continue;
        const bulletBox = new Box3().setFromCenterAndSize(new Vector3(...bullet.position), new Vector3(0.2, 0.5, 0.1));
        for (const enemy of updatedEnemies) {
            if (enemiesToRemove.has(enemy.id)) continue;
            const enemyBox = new Box3().setFromCenterAndSize(new Vector3(...enemy.position), new Vector3(1, 1, 1));
            if (bulletBox.intersectsBox(enemyBox)) {
                bulletsToRemove.add(bullet.id);
                enemy.health -= 1; // Or use bullet damage
                if (enemy.health <= 0) {
                    enemiesToRemove.add(enemy.id);
                    scoreToAdd += 100;
                }
                break; 
            }
        }
    }

    // Player-Enemy Collision
    if (playerRef.current) {
        const playerBox = new Box3().setFromObject(playerRef.current);
        for (const enemy of updatedEnemies) {
            if (enemiesToRemove.has(enemy.id)) continue;
            const enemyBox = new Box3().setFromCenterAndSize(new Vector3(...enemy.position), new Vector3(1, 1, 1));
            if (playerBox.intersectsBox(enemyBox)) {
                enemiesToRemove.add(enemy.id);
                healthToLose += enemy.ufoData.stats.damage;
            }
        }
    }

    // Update State
    if (bulletsToRemove.size > 0 || enemiesToRemove.size > 0) {
        setBullets(updatedBullets.filter(b => !bulletsToRemove.has(b.id)));
        setEnemies(updatedEnemies.filter(e => !enemiesToRemove.has(e.id)));
    } else {
        setEnemies(updatedEnemies);
    }
    
    if (scoreToAdd > 0 || healthToLose > 0) {
        updateGameState(prev => ({
            score: prev.score + scoreToAdd,
            playerHealth: prev.playerHealth - healthToLose
        }));
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
      <PlayerShip ref={playerRef} onShoot={addBullet} isShooting={isShooting} />

      {/* Render Bullets */}
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} {...bullet} />
      ))}

      {/* Render Enemies */}
      {enemies.map((enemy) => (
        <EnemyShip key={enemy.id} {...enemy} />
      ))}
    </>
  );
}

export default GameScene;
