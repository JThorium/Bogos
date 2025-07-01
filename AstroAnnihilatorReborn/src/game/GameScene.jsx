import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { useGame } from './GameProvider';
import PlayerShip from './entities/PlayerShip';
import EnemyShip from './entities/EnemyShip';
import Bullet from './entities/Bullet';
import BombPickup from './entities/BombPickup';
import Starfield from './Starfield';
import { ufos } from './UFOData';
import { getUfoDimensions } from './entities/PlayerShip'; // Reusing the helper from PlayerShip

// Reusable Three.js objects to minimize GC
const _vector3 = new Vector3();
const _playerBox = new Box3();
const _enemyBox = new Box3();
const _bulletBox = new Box3();

function GameScene() {
    const { viewport } = useThree();
    const { gameState, updateGameState } = useGame();
    
    const [bullets, setBullets] = useState([]);
    const [enemies, setEnemies] = useState([]);
    const [bombPickups, setBombPickups] = useState([]);
    const playerRef = useRef();
    const lastSpawnTime = useRef(0);
    const spawnInterval = 1; 
    const [isPaused, setIsPaused] = useState(false);
    const [showHangar, setShowHangar] = useState(false); // New state for hangar
    const abilityState = useRef({ name: null, active: false, charge: 0, duration: 0, cooldown: 0, cycleIndex: 0 });
    const ghostTimer = useRef(0);
    const spectreTimer = useRef(0);
    const reaperBoost = useRef(0);
    const phoenixUsed = useRef(false);

    const addBullet = useCallback((position) => {
        setBullets(prev => [...prev, { id: Date.now(), position, firedByPlayer: true, speed: 10, color: 'yellow' }]);
    }, []);

    const addEnemyBullet = useCallback((position) => {
        setBullets(prev => [...prev, { id: Date.now(), position, firedByPlayer: false, speed: -5, color: 'red' }]);
    }, []);
    
    const useBomb = useCallback(() => {
        console.log("Bomb used!");
        // Implement bomb logic here (clear enemies, clear enemy bullets, etc.)
        setEnemies([]); // Clear enemies
        setBullets(prev => prev.filter(b => b.firedByPlayer)); // Clear enemy bullets
        // TODO: Decrement bomb count from gameState
    }, []);

    const togglePause = useCallback(() => {
      setIsPaused(prev => !prev);
      updateGameState(prev => ({ currentScreen: isPaused ? 'playing' : 'paused' }));
    }, [isPaused, updateGameState]);

    const openHangar = useCallback(() => {
      setShowHangar(true);
      updateGameState(prev => ({ ...prev, currentScreen: 'hangar' })); // Assuming 'hangar' is a valid screen state
    }, [updateGameState]);

    const closeHangar = useCallback(() => {
      setShowHangar(false);
      updateGameState(prev => ({ ...prev, currentScreen: 'playing' })); // Return to playing after closing hangar
    }, [updateGameState]);

    const handleAbilityHold = useCallback(() => {
      if (!gameState.currentUFO || abilityState.current.active || abilityState.current.cooldown > 0) return;

      let abilityToUse = gameState.selectedUFOId;
      // TODO: Implement fusion/omega ability cycling logic here if needed
      // For now, assume abilityToUse is selectedUFOId

      if (gameState.currentUFO.ability) { // Check if the current UFO has an ability
        // Specific checks for abilities that require resources or conditions
        if ((abilityToUse === 'paladin' && abilityState.current.charge < 10) ||
            (abilityToUse === 'sentinel' && gameState.playerShield <= 0) ||
            (abilityToUse === 'phoenix' && phoenixUsed.current)) {
          return;
        }

        abilityState.current.name = abilityToUse;
        abilityState.current.active = true;
        abilityState.current.duration = 0;
        // TODO: Add visual feedback for ability activation (e.g., pulsing effect on player ship)
        console.log(`Ability '${abilityToUse}' activated!`);
      }
    }, [gameState.currentUFO, gameState.selectedUFOId, gameState.playerShield]);

    const releaseAbility = useCallback(() => {
      if (!abilityState.current.active) return;

      // TODO: Implement release effects for abilities like Warlock's missile swarm
      // if (abilityState.current.name === 'warlock') {
      //   const chargeLevel = Math.min(10, Math.floor(abilityState.current.duration / 15));
      //   for(let i=0; i < chargeLevel; i++) {
      //     const angle = (i / chargeLevel) * Math.PI*2;
      //     setBullets(prev => [...prev, { id: Date.now(), position: playerRef.current.position.toArray(), firedByPlayer: true, speed: 4, color: 'purple', isHoming: true }]);
      //   }
      // }

      abilityState.current.active = false;
      abilityState.current.cooldown = 60; // Example cooldown
      abilityState.current.name = null;
      // TODO: Remove visual feedback for ability activation
      console.log("Ability released!");
    }, []);

    useEffect(() => {
        const handleDoubleClick = (e) => {
          if (e.button === 0) { // Left mouse button double click
            useBomb();
          }
        };
        const handleRightClick = (e) => {
          e.preventDefault(); // Prevent context menu
          openHangar();
        };
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            togglePause();
          }
        };

        // Mobile Controls (Placeholder - requires a gesture library or custom touch handling)
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCount = 0;
        let lastTapTime = 0;
        let tapCount = 0;

        const handleTouchStart = (e) => {
          touchCount = e.touches.length;
          if (touchCount === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            // For ability hold on mobile (single finger drag/hold)
            // isAbilityActive.current = true; // This would be for a single-finger hold ability
          } else if (touchCount === 2) {
            // Two fingers for ability activation
            // Calculate midpoint for movement, and activate ability
            handleAbilityHold();
          }
        };

        const handleTouchMove = (e) => {
          e.preventDefault(); // Prevent scrolling
          if (touchCount === 1) {
            // Single finger drag for movement
            // Update player position based on touch movement
            // This is already handled by useFrame mouse.x/y for PC, need to adapt for mobile touch
            // For now, mouse.x/y are updated by mousemove, need to map touch to mouse.x/y
          } else if (touchCount === 2) {
            // Two fingers for movement and ability
            // Calculate midpoint and update player position
          }
        };

        const handleTouchEnd = (e) => {
          const touchDuration = Date.now() - touchStartTime;
          if (touchCount === 1 && touchDuration < 300) { // Short tap
            // Single tap - maybe for shooting if not autofire
          } else if (touchCount === 2 && touchDuration < 300) { // Two-finger double tap for bomb
            const currentTime = Date.now();
            if (currentTime - lastTapTime < 300) { // Double tap
              useBomb();
              tapCount = 0; // Reset tap count after bomb
            } else {
              tapCount = 1;
            }
            lastTapTime = currentTime;
          } else if (touchCount === 3 && touchDuration < 300) { // Three-finger double tap for hangar
            const currentTime = Date.now();
            if (currentTime - lastTapTime < 300) { // Double tap
              openHangar();
              tapCount = 0; // Reset tap count
            } else {
              tapCount = 1;
            }
            lastTapTime = currentTime;
          }
          // isAbilityActive.current = false; // Release ability on touch end
          releaseAbility(); // Release ability on touch end
          touchCount = 0;
        };

        window.addEventListener('dblclick', handleDoubleClick);
        window.addEventListener('contextmenu', handleRightClick); // Right click
        window.addEventListener('keydown', handleKeyDown);

        // Add touch event listeners
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
          window.removeEventListener('dblclick', handleDoubleClick);
          window.removeEventListener('contextmenu', handleRightClick);
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('touchstart', handleTouchStart);
          window.removeEventListener('touchmove', handleTouchMove);
          window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [useBomb, togglePause, openHangar, handleAbilityHold, releaseAbility]);


    useFrame((state, delta) => {
        if (gameState.currentScreen !== 'playing' || isPaused || showHangar) return; // Pause game logic if hangar is open

        // Initialize accumulators for this frame's changes
        let scoreChange = 0;
        let healthLostAccumulator = 0;
        let newBombsCollected = 0;

        // Update gameFrame
        updateGameState(prev => ({ ...prev, gameFrame: prev.gameFrame + 1 }));
        if (ghostTimer.current > 0) ghostTimer.current--;
        if (spectreTimer.current > 0) spectreTimer.current--; // Decrement spectre timer

        // --- 1. Move entities and filter out-of-bounds ---
        const updatedBullets = bullets.map(b => ({ ...b, position: [b.position[0], b.position[1] + b.speed * delta, b.position[2]] }))
                                        .filter(b => b.position[1] < viewport.height / 2 + 1 && b.position[1] > -viewport.height / 2 - 1);

        let currentEnemies = enemies.map(e => ({ ...e, position: [e.position[0], e.position[1] - e.speed * delta, e.position[2]] })) // Apply delta for frame-rate independent movement
                                        .filter(e => e.position[1] > -viewport.height / 2 - 5);

        const updatedBombPickups = bombPickups.map(p => ({ ...p, position: [p.position[0], p.position[1] - p.speed * delta, p.position[2]] })) // Apply delta
                                              .filter(p => p.position[1] > -viewport.height / 2 - 5);


        // --- 2. Spawn new enemies (WaveManager logic) ---
        // This logic needs to be more sophisticated, based on the HTML version's WaveManager
        // For now, keep simple spawning, but note this needs full porting later.
        if (state.clock.elapsedTime - lastSpawnTime.current > spawnInterval) {
            const randomUfo = ufos[Math.floor(Math.random() * ufos.length)];
            const newEnemy = {
                id: Date.now(),
                position: [(Math.random() - 0.5) * (viewport.width - 2), viewport.height / 2 + 1, 0],
                ufoData: {
                    ...randomUfo,
                    speed: Math.random() > 0.5 ? 1 : -1, // Random direction for horizontal movement
                    shoot: 'single' // Default shooting pattern
                },
                speed: 0.15, // Base speed, will be multiplied by delta
                health: randomUfo.stats.health,
                type: randomUfo.id, // Add type for enemy behavior
                shootCooldown: randomUfo.stats.shotCooldown * 60, // Convert to frames
                phase: 0, // For enemy movement patterns
            };
            currentEnemies.push(newEnemy); // Add to currentEnemies for this frame's processing
            console.log("Spawning enemy:", newEnemy);
            lastSpawnTime.current = state.clock.elapsedTime;
        }
        
        // --- 3. Process Collisions ---
        const bulletsToDestroy = new Set();
        const enemiesDestroyed = new Set();
        const pickupsToCollect = new Set();

        const playerMesh = playerRef.current;
        const playerBoundingBox = playerMesh ? _playerBox.setFromObject(playerMesh) : null;
        
        // Bullet-Enemy Collisions
        for (const enemy of currentEnemies) {
            if (enemiesDestroyed.has(enemy.id)) continue; 

            const { width: enemyWidth, height: enemyHeight } = getUfoDimensions(enemy.ufoData.geometry);
            _enemyBox.setFromCenterAndSize(_vector3.set(...enemy.position), _vector3.set(enemyWidth, enemyHeight, 1)); 
            
            for (const bullet of updatedBullets) {
                // Player bullet hitting enemy
                if (bullet.firedByPlayer && !bulletsToDestroy.has(bullet.id)) {
                    // Assuming bullet dimensions are fixed as per Bullet.jsx
                    _bulletBox.setFromCenterAndSize(_vector3.set(...bullet.position), _vector3.set(0.2, 0.5, 0.1)); 
                    
                    if (_enemyBox.intersectsBox(_bulletBox)) { 
                        bulletsToDestroy.add(bullet.id); 
                        enemy.health -= 1; 
                        if (enemy.health <= 0) {
                            enemiesDestroyed.add(enemy.id);
                            scoreChange += 100;
                            if (Math.random() < 0.1) { 
                              updatedBombPickups.push({
                                id: Date.now(),
                                position: [...enemy.position],
                                speed: 0.03, 
                                color: 'red', 
                                type: 'bomb'
                              });
                            }
                        }
                        break; 
                    }
                }
            }
        }
        
        // Player-Enemy Collisions
        for (const enemy of currentEnemies) {
            if (enemiesDestroyed.has(enemy.id)) continue; 
            const { width: enemyWidth, height: enemyHeight } = getUfoDimensions(enemy.ufoData.geometry);
            _enemyBox.setFromCenterAndSize(_vector3.set(...enemy.position), _vector3.set(enemyWidth, enemyHeight, 1)); 
            if (playerBoundingBox && playerBoundingBox.intersectsBox(_enemyBox)) {
                // Check for player intangibility
                let isIntangible = ghostTimer.current > 0 || (gameState.currentUFO.id === 'spectre' && spectreTimer.current > 480) || (abilityState.current.name === 'ghost' && abilityState.current.active) || (abilityState.current.name === 'juggernaut' && abilityState.current.active);
                if (!isIntangible) {
                    healthLostAccumulator += enemy.ufoData.stats.damage;
                    enemiesDestroyed.add(enemy.id); 
                    // Trigger ghost timer if player is 'ghost' type
                    if (gameState.currentUFO.id === 'ghost') ghostTimer.current = 120;
                }
            }
        }

        // Enemy Bullet-Player Collisions
        for (const bullet of updatedBullets) {
            if (!bullet.firedByPlayer && !bulletsToDestroy.has(bullet.id)) {
                // Assuming bullet dimensions are fixed as per Bullet.jsx
                _bulletBox.setFromCenterAndSize(_vector3.set(...bullet.position), _vector3.set(0.2, 0.5, 0.1)); 
                if (playerBoundingBox && playerBoundingBox.intersectsBox(_bulletBox)) {
                    // Check for player intangibility
                    let isIntangible = ghostTimer.current > 0 || (gameState.currentUFO.id === 'spectre' && spectreTimer.current > 480) || (abilityState.current.name === 'ghost' && abilityState.current.active) || (abilityState.current.name === 'juggernaut' && abilityState.current.active);
                    if (!isIntangible) {
                        healthLostAccumulator += 1; // Assuming enemy bullets deal 1 damage
                        bulletsToDestroy.add(bullet.id);
                        // Trigger ghost timer if player is 'ghost' type
                        if (gameState.currentUFO.id === 'ghost') ghostTimer.current = 120;
                    }
                }
            }
        }
        
        // Player-Bomb Pickup Collisions
        for (const pickup of updatedBombPickups) {
            if (pickupsToCollect.has(pickup.id)) continue;
            // Assuming bomb pickup dimensions are fixed
            _bulletBox.setFromCenterAndSize(_vector3.set(...pickup.position), _vector3.set(0.5, 0.5, 0.5)); 
            if (playerBoundingBox && playerBoundingBox.intersectsBox(_bulletBox)) {
                pickupsToCollect.add(pickup.id);
                newBombsCollected += 1;
                console.log("Bomb collected!"); 
            }
        }

        // --- 4. Apply all state changes ---
        setBullets(updatedBullets.filter(b => !bulletsToDestroy.has(b.id)));
        setEnemies(currentEnemies.filter(e => !enemiesDestroyed.has(e.id)));
        setBombPickups(updatedBombPickups.filter(p => !pickupsToCollect.has(p.id)));

        // Update global game state
        if (scoreChange > 0 || healthLostAccumulator > 0 || newBombsCollected > 0) {
            updateGameState(prev => {
                const newHealth = prev.playerHealth - healthLostAccumulator;
                const newBombs = prev.playerBombs + newBombsCollected; // Use playerBombs from gameState
                if (newHealth <= 0 && prev.currentScreen === 'playing') {
                    return {
                        ...prev,
                        score: prev.score + scoreChange,
                        playerHealth: 0,
                        playerBombs: newBombs,
                        isGameOver: true, // Set isGameOver state
                        currentScreen: 'gameOver',
                    };
                }
                return {
                    ...prev,
                    score: prev.score + scoreChange,
                    playerHealth: newHealth,
                    playerBombs: newBombs,
                };
            });
        }

        // --- 5. Update Player Abilities ---
        if (abilityState.current.cooldown > 0) abilityState.current.cooldown--;
        if (gameState.currentUFO.id === 'spectre') spectreTimer.current = (gameState.gameFrame + 1) % 600;

        if (abilityState.current.active) {
            abilityState.current.duration++;
            const state = abilityState.current;
            switch(state.name) {
                case 'paladin':
                    // sfx.laser.triggerAttack(); // Need Tone.js integration
                    // playerBullets.push(new Bullet(this.x, this.y - 20, 0, -20, UFO_TYPES.paladin.color, 0.5));
                    if(state.duration > 300) {
                        releaseAbility();
                        abilityState.current.charge = 0;
                    }
                    break;
                case 'sentinel':
                    if(state.duration === 1) {
                        // createExplosion(playerRef.current.position.x, playerRef.current.position.y, ufos.find(u => u.id === 'sentinel').colors, 25);
                        updateGameState(prev => ({ ...prev, playerShield: prev.playerShield - 1 }));
                        setBullets(prev => prev.filter(b => b.firedByPlayer)); // Clear enemy bullets
                    }
                    if(state.duration > 10) releaseAbility();
                    break;
                case 'juggernaut':
                    if(gameState.gameFrame % 5 === 0) {
                        // playerBullets.push(new Bullet(this.x, this.y, -8, 0, UFO_TYPES.juggernaut.color, 2));
                        // playerBullets.push(new Bullet(this.x, this.y, 8, 0, UFO_TYPES.juggernaut.color, 2));
                    }
                    if(state.duration > 90) releaseAbility();
                    break;
                case 'vortex':
                    setBullets(prev => prev.map(b => {
                        if (!b.firedByPlayer) {
                            const dx = playerRef.current.position.x - b.position[0];
                            const dy = playerRef.current.position.y - b.position[1];
                            const dist = Math.hypot(dx, dy);
                            if (dist < 150) {
                                b.position[0] += dx / dist * 4 * delta;
                                b.position[1] += dy / dist * 4 * delta;
                                if (dist < 20) {
                                    return null; // Mark for removal
                                }
                            }
                        }
                        return b;
                    }).filter(Boolean)); // Filter out nulls
                    if(state.duration > 300) releaseAbility();
                    break;
                case 'alchemist':
                    setBullets(prev => prev.map(b => {
                        if (!b.firedByPlayer) {
                            const dx = playerRef.current.position.x - b.position[0];
                            const dy = playerRef.current.position.y - b.position[1];
                            const dist = Math.hypot(dx, dy);
                            if (dist < 80) {
                                updateGameState(prev => ({ ...prev, waveCredits: prev.waveCredits + 1 }));
                                return null; // Mark for removal
                            }
                        }
                        return b;
                    }).filter(Boolean));
                    // TODO: Add chance for kills to drop powerups
                    if(state.duration > 300) releaseAbility();
                    break;
                case 'berserker':
                    if(gameState.gameFrame % 30 === 0 && gameState.playerHealth > 1) {
                        updateGameState(prev => ({ ...prev, playerHealth: prev.playerHealth - 1 }));
                        // createExplosion(playerRef.current.position.x, playerRef.current.position.y, ufos.find(u => u.id === 'berserker').colors, 2);
                    }
                    if(gameState.playerHealth <= 1 || state.duration > 180) releaseAbility();
                    break;
                case 'phoenix':
                    if(state.duration === 1 && !phoenixUsed.current) {
                        phoenixUsed.current = true;
                        updateGameState(prev => ({ ...prev, playerHealth: ufos.find(ufo => ufo.id === gameState.selectedUFOId).stats.health, playerShield: 0 }));
                        ghostTimer.current = 360;
                        // createExplosion(playerRef.current.position.x, playerRef.current.position.y, ufos.find(u => u.id === 'phoenix').colors, 150);
                        setEnemies([]); // Clear enemies
                        setBullets(prev => prev.filter(b => b.firedByPlayer)); // Clear enemy bullets
                    }
                    releaseAbility();
                    break;
                case 'engineer':
                    if(state.duration === 1) {
                        // TODO: Implement Sentry spawning
                        // turrets.push(new Sentry(playerRef.current.position));
                    }
                    releaseAbility();
                    break;
                case 'reaper':
                    setEnemies(prev => prev.map(e => {
                        const dx = playerRef.current.position.x - e.position[0];
                        const dy = playerRef.current.position.y - e.position[1];
                        const dist = Math.hypot(dx, dy);
                        if (dist < 200) {
                            // TODO: Add RawMaterialPickup
                            // powerups.push(new RawMaterialPickup(e.position[0], e.position[1]));
                            return null; // Mark for removal
                        }
                        return e;
                    }).filter(Boolean));
                    setBullets(prev => prev.map(b => {
                        if (!b.firedByPlayer) {
                            const dx = playerRef.current.position.x - b.position[0];
                            const dy = playerRef.current.position.y - b.position[1];
                            const dist = Math.hypot(dx, dy);
                            if (dist < 200) {
                                // TODO: Add RawMaterialPickup
                                // powerups.push(new RawMaterialPickup(b.position[0], b.position[1]));
                                return null; // Mark for removal
                            }
                        }
                        return b;
                    }).filter(Boolean));
                    if(state.duration > 180) releaseAbility();
                    break;
                default:
                    if(state.duration > 120 && state.name !== 'warlock') releaseAbility();
                    break;
            }
        }
    });

    // Handle game over screen logic
    useEffect(() => {
        if (gameState.currentScreen === 'gameOver') {
            console.log("GAME OVER!");
            const timer = setTimeout(() => {
                updateGameState({ currentScreen: 'mainMenu', playerHealth: ufos.find(ufo => ufo.id === gameState.selectedUFOId).stats.health, score: 0, bombs: 0 });
                setBullets([]); 
                setEnemies([]); 
                setBombPickups([]); 
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameState.currentScreen, updateGameState, gameState.selectedUFOId]);


    return (
        <>
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.2} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.6} />
            <pointLight position={[0, 0, 5]} intensity={0.8} color="#ffffff" />
            
            {/* Render PlayerShip */}
            {gameState.currentScreen === 'playing' && <PlayerShip ref={playerRef} onShoot={addBullet} onAbilityHold={handleAbilityHold} />}

            {/* Render Enemies */}
            {enemies.map(enemy => (
                <EnemyShip key={enemy.id} position={enemy.position} ufoData={enemy.ufoData} onEnemyShoot={addEnemyBullet} />
            ))}

            {/* Render Hangar UI */}
            {showHangar && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '20px',
                    borderRadius: '10px',
                    color: 'white',
                    zIndex: 1000,
                    width: '80%',
                    maxWidth: '600px',
                    maxHeight: '80%',
                    overflowY: 'auto',
                    pointerEvents: 'all', // Make it interactive
                }}>
                    <h2>Hangar</h2>
                    <p>This is the in-game hangar. You can swap UFOs or buy upgrades here.</p>
                    <button onClick={closeHangar} style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#f59e0b',
                        color: 'black',
                        fontWeight: 'bold',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}>Close Hangar</button>
                </div>
            )}

            {/* Render Bullets */}
            {bullets.map(bullet => (
                <Bullet key={bullet.id} position={bullet.position} speed={bullet.speed} color={bullet.color} firedByPlayer={bullet.firedByPlayer} />
            ))}

            {/* Render Bomb Pickups */}
            {bombPickups.map(pickup => (
                <BombPickup key={pickup.id} position={pickup.position} color={pickup.color} />
            ))}
        </>
    );
}

export default GameScene;
