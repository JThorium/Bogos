import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { useGame } from './GameProvider';
import PlayerShip from './entities/PlayerShip';
import EnemyShip from './entities/EnemyShip';
import Bullet from './entities/Bullet';
import BombPickup from './entities/BombPickup'; // Import BombPickup
import Starfield from './Starfield';
import { ufos } from './UFOData';

function GameScene() {
    const { viewport } = useThree();
    const { gameState, updateGameState } = useGame();
    
    // Use refs for mutable state within useFrame
    const bulletsRef = useRef([]);
    const enemiesRef = useRef([]);
    const bombPickupsRef = useRef([]); 
    const [_, setRenderTrigger] = useState(0); // Dummy state to force re-render when refs update

    const playerRef = useRef();
    const lastSpawnTime = useRef(0);
    const spawnInterval = 1; // seconds
    const [isPaused, setIsPaused] = useState(false);

    const addBullet = useCallback((position) => {
        bulletsRef.current.push({ id: Date.now(), position, firedByPlayer: true, speed: 5, color: 'yellow' });
        setRenderTrigger(prev => prev + 1); // Trigger re-render
    }, []);
    
    const useBomb = () => {
        console.log("Bomb used!");
        enemiesRef.current = [];
        bulletsRef.current = bulletsRef.current.filter(b => !b.firedByPlayer); // Remove only enemy bullets
        setRenderTrigger(prev => prev + 1); // Trigger re-render
    };

    const togglePause = () => {
      setIsPaused(!isPaused);
      updateGameState(prev => ({ currentScreen: isPaused ? 'playing' : 'paused' }));
    };

    useEffect(() => {
        const handleDoubleClick = () => useBomb();
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            togglePause();
          }
        };
        window.addEventListener('dblclick', handleDoubleClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
          window.removeEventListener('dblclick', handleDoubleClick);
          window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPaused, togglePause]);


    useFrame((state, delta) => {
        if (gameState.currentScreen !== 'playing' || isPaused) return;

        // --- Prepare for next frame's state (operate on local copies for processing) ---
        let currentBullets = [...bulletsRef.current];
        let currentEnemies = [...enemiesRef.current];
        let currentBombPickups = [...bombPickupsRef.current];
        
        let scoreAccumulator = 0;
        let healthLostAccumulator = 0;
        
        const nextBullets = [];
        const nextEnemies = [];
        const nextBombPickups = [];

        const bulletsThatHit = new Set();
        const enemiesDestroyed = new Set();

        // --- 1. Move entities and filter out-of-bounds ---
        for (const bullet of currentBullets) {
            const newPos = [bullet.position[0], bullet.position[1] + bullet.speed * delta, bullet.position[2]];
            if (newPos[1] < viewport.height / 2 + 1 && newPos[1] > -viewport.height / 2 - 1) {
                nextBullets.push({ ...bullet, position: newPos });
            } else {
                bulletsThatHit.add(bullet.id); // Mark out-of-bounds bullets for removal
            }
        }

        for (const enemy of currentEnemies) {
            const newPos = [enemy.position[0], enemy.position[1] - enemy.speed, enemy.position[2]];
            if (newPos[1] > -viewport.height / 2 - 5) {
                nextEnemies.push({ ...enemy, position: newPos });
            } else {
                enemiesDestroyed.add(enemy.id); // Mark out-of-bounds enemies for removal
            }
        }

        for (const pickup of currentBombPickups) {
            const newPos = [pickup.position[0], pickup.position[1] - pickup.speed, pickup.position[2]];
            if (newPos[1] > -viewport.height / 2 - 5) {
                nextBombPickups.push({ ...pickup, position: newPos });
            } else {
                // Pickups falling off screen are implicitly removed
            }
        }


        // --- 2. Spawn new enemies ---
        if (state.clock.elapsedTime - lastSpawnTime.current > spawnInterval) {
            const enemyUfoOptions = ufos.filter((ufo) => ufo.id !== gameState.selectedUFOId);
            const randomUfo = enemyUfoOptions[Math.floor(Math.random() * enemyUfoOptions.length)];
            nextEnemies.push({
                id: Date.now(),
                position: [(Math.random() - 0.5) * (viewport.width - 2), viewport.height / 2 + 1, 0],
                ufoData: randomUfo,
                speed: 0.05,
                health: randomUfo.stats.health,
            });
            lastSpawnTime.current = state.clock.elapsedTime;
        }
        
        // --- 3. Process Collisions ---
        const playerBox = playerRef.current ? new Box3().setFromObject(playerRef.current) : null;
        
        // Bullet-Enemy Collisions
        const enemiesAfterBulletHits = [];
        for (const enemy of nextEnemies) {
            let enemyHitByBullet = false;
            const enemyBox = new Box3().setFromCenterAndSize(new Vector3(...enemy.position), new Vector3(1, 1, 1));
            
            for (const bullet of nextBullets) {
                if (bullet.firedByPlayer && !bulletsThatHit.has(bullet.id)) { // Check if bullet is still active
                    const bulletBox = new Box3().setFromCenterAndSize(new Vector3(...bullet.position), new Vector3(0.2, 0.5, 0.1));
                    if (enemyBox.intersectsBox(bulletBox)) {
                        bulletsThatHit.add(bullet.id); // Mark bullet as hit
                        enemy.health -= 1; // Bullet damage
                        enemyHitByBullet = true;
                    }
                }
            }

            if (enemy.health <= 0) { // Enemy destroyed by bullet
                enemiesDestroyed.add(enemy.id);
                scoreAccumulator += 100;
                // Add bomb drop chance
                if (Math.random() < 0.1) { 
                  nextBombPickups.push({
                    id: Date.now(),
                    position: [...enemy.position],
                    speed: 0.03, 
                    color: 'red', 
                    type: 'bomb'
                  });
                }
            } else {
                enemiesAfterBulletHits.push(enemy); // Enemy survives bullet hits
            }
        }
        
        // Player-Enemy Collisions
        const enemiesAfterPlayerCollision = [];
        for (const enemy of enemiesAfterBulletHits) { // Only check enemies that survived bullet hits
            const enemyBox = new Box3().setFromCenterAndSize(new Vector3(...enemy.position), new Vector3(1, 1, 1));
            if (playerBox && playerBox.intersectsBox(enemyBox)) {
                healthLostAccumulator += enemy.ufoData.stats.damage;
                enemiesDestroyed.add(enemy.id); // Mark enemy for destruction by player
            } else {
                enemiesAfterPlayerCollision.push(enemy);
            }
        }
        
        // Player-Bomb Pickup Collisions
        const finalBombPickups = [];
        for (const pickup of nextBombPickups) {
            const pickupBox = new Box3().setFromCenterAndSize(new Vector3(...pickup.position), new Vector3(0.5, 0.5, 0.5));
            if (playerBox && playerBox.intersectsBox(pickupBox)) {
                // Bomb collected logic (not yet adding to inventory, just logging)
                console.log("Bomb collected!");
            } else {
                finalBombPickups.push(pickup);
            }
        }

        // --- 4. Apply all state changes to refs ---
        bulletsRef.current = nextBullets.filter(b => !bulletsThatHit.has(b.id));
        enemiesRef.current = enemiesAfterPlayerCollision; // This array already excludes destroyed enemies
        bombPickupsRef.current = finalBombPickups;

        // Trigger re-render
        setRenderTrigger(prev => prev + 1);

        // Update global game state
        if (scoreAccumulator > 0 || healthLostAccumulator > 0) {
            updateGameState(prev => ({
                score: prev.score + scoreAccumulator,
                playerHealth: prev.playerHealth - healthLostAccumulator
            }));
        }
        
        // Game Over Check
        if (gameState.playerHealth - healthLostAccumulator <= 0 && gameState.currentScreen === 'playing') {
          updateGameState({ currentScreen: 'gameOver' });
        }
    });

    // Handle game over screen logic
    useEffect(() => {
        if (gameState.currentScreen === 'gameOver') {
            console.log("GAME OVER!");
            const timer = setTimeout(() => {
                updateGameState({ currentScreen: 'mainMenu', playerHealth: ufos.find(ufo => ufo.id === gameState.selectedUFOId).stats.health, score: 0 });
                bulletsRef.current = [];
                enemiesRef.current = [];
                bombPickupsRef.current = []; 
                setRenderTrigger(prev => prev + 1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState.currentScreen, updateGameState, gameState.selectedUFOId]);


    return (
        <>
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.8} />
            <pointLight position={[0, 0, 5]} intensity={0.5} />
            <Starfield />
            <PlayerShip ref={playerRef} onShoot={addBullet} />
            {bulletsRef.current.map((bullet) => <Bullet key={bullet.id} {...bullet} />)}
            {enemiesRef.current.map((enemy) => <EnemyShip key={enemy.id} {...enemy} />)}
            {bombPickupsRef.current.map((pickup) => <BombPickup key={pickup.id} {...pickup} />)}
        </>
    );
}

export default GameScene;
