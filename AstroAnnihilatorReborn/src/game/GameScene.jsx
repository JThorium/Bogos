import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { useGame } from './GameProvider';
import EnemyShip from './entities/EnemyShip';
import Bullet from './entities/Bullet';
import BombPickup from './entities/BombPickup';
import Starfield from './Starfield';
import { ufos, ENEMY_MODELS, ASTEROID_MODEL, BOSS_MODEL_1, BOSS_MODEL_2 } from './UFOData';
import { getUfoDimensions } from './entities/PlayerShip'; // Reusing the helper from PlayerShip
import Particle from './entities/Particle';
import Powerup from './entities/Powerup';
import { ParticleSystem } from './entities/Particle';
import GameEntity from './entities/GameEntity';
import * as THREE from 'three';
import Player from './entities/Player.js';

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
    const playerInstance = useRef(null);
    const [playerState, setPlayerState] = useState({ x: 0, y: 0, health: 3, shield: 0, bombs: 0 });
    const lastSpawnTime = useRef(0);
    const spawnInterval = 1; 
    const [isPaused, setIsPaused] = useState(false);
    const [showHangar, setShowHangar] = useState(false); // New state for hangar
    const abilityState = useRef({ name: null, active: false, charge: 0, duration: 0, cooldown: 0, cycleIndex: 0 });
    const ghostTimer = useRef(0);
    const spectreTimer = useRef(0);
    const reaperBoost = useRef(0);
    const phoenixUsed = useRef(false);
    const [asteroids, setAsteroids] = useState([]);
    const asteroidSpawnInterval = 3; // seconds
    const lastAsteroidSpawnTime = useRef(0);
    const maxAsteroids = 10;
    const [boss, setBoss] = useState(null);
    const [waveCount, setWaveCount] = useState(0);
    const bossSpawnScore = useRef(7500);
    const [particles, setParticles] = useState([]);
    const [powerups, setPowerups] = useState([]);
    const enemiesRef = useRef([]);

    const addBullet = useCallback((position) => {
        setBullets(prev => [...prev, { id: Date.now(), position, firedByPlayer: true, speed: 10, color: 'yellow' }]);
    }, []);

    const addEnemyBullet = useCallback((position) => {
        setBullets(prev => [...prev, { id: Date.now(), position, firedByPlayer: false, speed: -5, color: 'red' }]);
    }, []);
    
    const useBomb = useCallback(() => {
        if (gameState.playerBombs <= 0) {
            return;
        }
        setEnemies([]); // Clear enemies
        setBullets(prev => prev.filter(b => b.firedByPlayer)); // Clear enemy bullets
        updateGameState(prev => ({ playerBombs: prev.playerBombs - 1 }));
    }, [gameState.playerBombs, updateGameState]);

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
        // console.log(`Ability '${abilityToUse}' activated!`);
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
      // console.log("Ability released!");
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

    // Initialize player on mount or when UFO/Upgrades change
    useEffect(() => {
      const ufo = gameState.currentUFO || { id: 'interceptor', color: '#34d399', stats: { shotCooldown: 0.25 } };
      playerInstance.current = new Player({
        x: 0,
        y: -viewport.height / 2 + 2,
        ufo,
        upgrades: gameState.upgrades,
        gameMode: gameState.gameMode,
        fusionConfig: gameState.fusionConfig,
        isCombineAllActive: gameState.isCombineAllActive,
      });
      setPlayerState({
        x: playerInstance.current.x,
        y: playerInstance.current.y,
        health: playerInstance.current.health,
        shield: playerInstance.current.shield,
        bombs: playerInstance.current.bombs,
      });
    }, [gameState.currentUFO, gameState.upgrades, gameState.gameMode, gameState.fusionConfig, gameState.isCombineAllActive, viewport.height]);

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

        let currentEnemies = enemiesRef.current.map(e => ({ ...e, position: [e.position[0], e.position[1] - e.speed * delta, e.position[2]] })) // Apply delta for frame-rate independent movement
                                        .filter(e => e.position[1] > -viewport.height / 2 - 5);

        const updatedBombPickups = bombPickups.map(p => ({ ...p, position: [p.position[0], p.position[1] - p.speed * delta, p.position[2]] })) // Apply delta
                                              .filter(p => p.position[1] > -viewport.height / 2 - 5);


        // --- 2. Spawn new enemies (WaveManager logic) ---
        // 2024-06-09T21:00Z: Refactored to use ENEMY_MODELS and per-spawn randomization for gameplay parity.
        if (state.clock.elapsedTime - lastSpawnTime.current > spawnInterval) {
            const enemyTypes = Object.keys(ENEMY_MODELS);
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const baseModel = ENEMY_MODELS[type];
            let stats = { ...baseModel.stats };
            switch (type) {
                case 'grunt':
                    stats.speedY = Math.random() * 1 + 1;
                    stats.speedX = (Math.random() - 0.5) * 4;
                    stats.shootCooldown = Math.random() * 100 + 50;
                    break;
                case 'tank':
                    stats.speedY = 1;
                    stats.speedX = 0;
                    stats.shootCooldown = 180;
                    break;
                case 'dasher':
                    stats.speedY = 5;
                    stats.speedX = 0;
                    stats.shootCooldown = 999;
                    break;
                case 'weaver':
                    stats.speedY = 2;
                    stats.speedX = 5;
                    stats.shootCooldown = 120;
                    break;
                case 'dodger':
                    stats.speedY = 1.5;
                    stats.speedX = 0;
                    stats.shootCooldown = 200;
                    break;
                case 'orbiter':
                    stats.speedY = 2;
                    stats.speedX = 0;
                    stats.shootCooldown = 30;
                    stats.targetY = Math.random() * (viewport.height * 0.4) + 50;
                    break;
                case 'kamikaze':
                    stats.speedY = 2;
                    stats.speedX = 0;
                    stats.shootCooldown = 999;
                    break;
                case 'sniper':
                    stats.speedY = 1;
                    stats.speedX = (Math.random() - 0.5) * 2;
                    stats.shootCooldown = 150;
                    break;
                case 'splitter':
                    stats.speedY = 1;
                    stats.speedX = 0;
                    stats.shootCooldown = 200;
                    break;
                case 'stealth':
                    stats.speedY = 1.5;
                    stats.speedX = (Math.random() * 2) - 1;
                    stats.shootCooldown = 100;
                    break;
                default:
                    break;
            }
            const newEnemy = {
                id: Date.now(),
                position: [(Math.random() - 0.5) * (viewport.width - 2), viewport.height / 2 + 1, 0],
                type,
                model: baseModel,
                stats: { ...stats },
                health: stats.health,
                phase: 0,
                shootCooldown: stats.shootCooldown,
            };
            currentEnemies.push(newEnemy);
            // console.log("Spawning enemy:", newEnemy);
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

            const { width: enemyWidth, height: enemyHeight } = getUfoDimensions(enemy.model.geometry);
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
            const { width: enemyWidth, height: enemyHeight } = getUfoDimensions(enemy.model.geometry);
            _enemyBox.setFromCenterAndSize(_vector3.set(...enemy.position), _vector3.set(enemyWidth, enemyHeight, 1)); 
            if (playerBoundingBox && playerBoundingBox.intersectsBox(_enemyBox)) {
                // Check for player intangibility
                let isIntangible = ghostTimer.current > 0 || (gameState.currentUFO && gameState.currentUFO.id === 'spectre' && spectreTimer.current > 480) || (abilityState.current.name === 'ghost' && abilityState.current.active) || (abilityState.current.name === 'juggernaut' && abilityState.current.active);
                if (!isIntangible) {
                    healthLostAccumulator += enemy.stats.damage;
                    enemiesDestroyed.add(enemy.id); 
                    // Trigger ghost timer if player is 'ghost' type
                    if (gameState.currentUFO && gameState.currentUFO.id === 'ghost') ghostTimer.current = 120;
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
                    let isIntangible = ghostTimer.current > 0 || (gameState.currentUFO && gameState.currentUFO.id === 'spectre' && spectreTimer.current > 480) || (abilityState.current.name === 'ghost' && abilityState.current.active) || (abilityState.current.name === 'juggernaut' && abilityState.current.active);
                    if (!isIntangible) {
                        healthLostAccumulator += 1; // Assuming enemy bullets deal 1 damage
                        bulletsToDestroy.add(bullet.id);
                        // Trigger ghost timer if player is 'ghost' type
                        if (gameState.currentUFO && gameState.currentUFO.id === 'ghost') ghostTimer.current = 120;
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
                // console.log("Bomb collected!"); 
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
        if (gameState.currentUFO && gameState.currentUFO.id === 'spectre') {
            spectreTimer.current = (gameState.gameFrame + 1) % 600;
        } else if (!gameState.currentUFO) {
            // console.warn('currentUFO is undefined in GameScene, skipping spectreTimer logic.');
        }

        if (abilityState.current.active) {
            abilityState.current.duration++;
            const state = abilityState.current;
            switch(state.name) {
                case 'interceptor':
                    // Rapid fire burst while held
                    if (gameState.gameFrame % 3 === 0 && playerRef.current) {
                        addBullet({
                            position: [playerRef.current.position.x, playerRef.current.position.y + 0.5, 0],
                            firedByPlayer: true,
                            color: 'yellow',
                            speed: 12,
                        });
                    }
                    break;
                case 'destroyer':
                    // Minion homing fire handled in Minion component (already implemented)
                    break;
                case 'sentinel':
                    if (state.duration === 1) {
                        addExplosion([playerRef.current.position.x, playerRef.current.position.y, 0], '#60a5fa', 25);
                        updateGameState(prev => ({ ...prev, playerShield: prev.playerShield - 1 }));
                        setBullets(prev => prev.filter(b => b.firedByPlayer)); // Clear enemy bullets
                    }
                    if(state.duration > 10) releaseAbility();
                    break;
                case 'paladin':
                    // Fires laser, absorbs shots to charge
                    addBullet({
                        position: [playerRef.current.position.x, playerRef.current.position.y - 1, 0],
                        firedByPlayer: true,
                        color: '#fde047',
                        speed: 20,
                        damage: 0.5,
                    });
                    if (state.duration > 300) {
                        releaseAbility();
                        abilityState.current.charge = 0;
                    }
                    break;
                case 'juggernaut':
                    // Invincible, side shots
                    if (gameState.gameFrame % 5 === 0 && playerRef.current) {
                        addBullet({
                            position: [playerRef.current.position.x - 1, playerRef.current.position.y, 0],
                            firedByPlayer: true,
                            color: '#fca5a5',
                            speed: 8,
                        });
                        addBullet({
                            position: [playerRef.current.position.x + 1, playerRef.current.position.y, 0],
                            firedByPlayer: true,
                            color: '#fca5a5',
                            speed: 8,
                        });
                    }
                    if(state.duration > 90) releaseAbility();
                    break;
                case 'vortex':
                    // Pull enemy bullets toward player, destroy if close
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
                    }).filter(Boolean));
                    if(state.duration > 300) releaseAbility();
                    break;
                case 'alchemist':
                    // Transmute enemy bullets to credits, kills drop powerups
                    setBullets(prev => prev.map(b => {
                        if (!b.firedByPlayer) {
                            const dx = playerRef.current.position.x - b.position[0];
                            const dy = playerRef.current.position.y - b.position[1];
                            const dist = Math.hypot(dx, dy);
                            if (dist < 80) {
                                updateGameState(prev => ({ ...prev, waveCredits: prev.waveCredits + 1 }));
                                // TODO: Add chance for kills to drop powerups
                                return null;
                            }
                        }
                        return b;
                    }).filter(Boolean));
                    if(state.duration > 300) releaseAbility();
                    break;
                case 'berserker':
                    // Sacrifice health for damage
                    if (gameState.gameFrame % 30 === 0 && gameState.playerHealth > 1) {
                        updateGameState(prev => ({ ...prev, playerHealth: prev.playerHealth - 1 }));
                        addExplosion([playerRef.current.position.x, playerRef.current.position.y, 0], '#ef4444', 2);
                    }
                    if (gameState.playerHealth <= 1 || state.duration > 180) releaseAbility();
                    break;
                case 'phoenix':
                    // Revive, nova, invincibility
                    if (state.duration === 1 && !phoenixUsed.current) {
                        phoenixUsed.current = true;
                        updateGameState(prev => ({ ...prev, playerHealth: ufos.find(ufo => ufo.id === gameState.selectedUFOId).stats.health, playerShield: 0 }));
                        ghostTimer.current = 360;
                        addExplosion([playerRef.current.position.x, playerRef.current.position.y, 0], '#fdba74', 150);
                        setEnemies([]);
                        setBullets(prev => prev.filter(b => b.firedByPlayer));
                    }
                    releaseAbility();
                    break;
                case 'engineer':
                    // Deploy sentry (placeholder)
                    if (state.duration === 1) {
                        // TODO: Implement Sentry spawning
                        // turrets.push(new Sentry(playerRef.current.position));
                    }
                    releaseAbility();
                    break;
                case 'reaper':
                    // Convert enemies/bullets to materials in a field
                    setEnemies(prev => prev.map(e => {
                        const dx = playerRef.current.position.x - e.position[0];
                        const dy = playerRef.current.position.y - e.position[1];
                        const dist = Math.hypot(dx, dy);
                        if (dist < 200) {
                            // TODO: Add RawMaterialPickup
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
                                return null; // Mark for removal
                            }
                        }
                        return b;
                    }).filter(Boolean));
                    if(state.duration > 180) releaseAbility();
                    break;
                case 'ghost':
                    // Intangibility handled in collision logic (skip damage if active)
                    break;
                case 'warlock':
                    // Homing shots, charge for missile swarm (on release)
                    if (gameState.gameFrame % 10 === 0 && playerRef.current) {
                        addBullet({
                            position: [playerRef.current.position.x, playerRef.current.position.y, 0],
                            firedByPlayer: true,
                            color: '#c084fc',
                            speed: 8,
                            isHoming: true,
                        });
                    }
                    break;
                case 'spectre':
                    // Intangible, charge for teleport (handled in collision logic and ability cycling)
                    if(state.duration > 120) releaseAbility();
                    break;
                case 'omega':
                case 'chimera':
                    // Cycle all abilities (already handled by cycling logic)
                    break;
                case 'chronomancer':
                    // Slow field (handled in enemy/bullet update logic)
                    // Visual effect can be added here
                    if(state.duration > 300) releaseAbility();
                    break;
                default:
                    if(state.duration > 120 && state.name !== 'warlock') releaseAbility();
                    break;
            }
        }

        // --- Asteroid Spawning ---
        if (state.clock.elapsedTime - lastAsteroidSpawnTime.current > asteroidSpawnInterval && asteroids.length < maxAsteroids) {
            // Randomize size, speedY, health per spawn
            const size = Math.random() * 20 + 15;
            const speedY = Math.random() * 1 + 0.5;
            const health = size / 10;
            const newAsteroid = {
                id: Date.now() + Math.random(),
                position: [(Math.random() - 0.5) * (viewport.width - 2), viewport.height / 2 + 1, 0],
                size,
                speedY,
                health,
                model: ASTEROID_MODEL,
            };
            setAsteroids(prev => [...prev, newAsteroid]);
            lastAsteroidSpawnTime.current = state.clock.elapsedTime;
        }
        // --- Asteroid Logic ---
        setAsteroids(prev => prev
            .map(a => ({ ...a, position: [a.position[0], a.position[1] - a.speedY * delta, a.position[2]] }))
            .filter(a => a.position[1] > -viewport.height / 2 - 5 && a.health > 0)
        );

        // --- Boss Spawning ---
        if (!boss && gameState.score >= bossSpawnScore.current) {
            setWaveCount(waveCount + 1);
            const model = (waveCount % 2 === 0) ? BOSS_MODEL_1 : BOSS_MODEL_2;
            setBoss({
                id: Date.now() + Math.random(),
                model,
                name: model.name,
                position: [0, viewport.height / 2 + 2, 0],
                size: 60,
                health: 80 + Math.floor(gameState.score / 1000),
                maxHealth: 80 + Math.floor(gameState.score / 1000),
                phase: 'entering',
                angle: 0,
                speedX: 2,
                targetY: 2,
            });
            bossSpawnScore.current += 10000 + bossSpawnScore.current * 0.2;
        }
        // --- Boss Logic ---
        if (boss) {
            setBoss(prev => {
                if (!prev) return null;
                let { position, phase, angle, speedX, targetY, health, maxHealth, lastAttackTime } = prev;
                angle += 0.01;
                if (phase === 'entering') {
                    position = [position[0], position[1] - (position[1] - targetY) * 0.05, position[2]];
                    if (Math.abs(position[1] - targetY) < 0.1) phase = 'fighting';
                } else if (phase === 'fighting') {
                    position = [position[0] + speedX * delta, position[1], position[2]];
                    if (position[0] < -viewport.width / 2 + prev.size || position[0] > viewport.width / 2 - prev.size) speedX *= -1;
                    // Boss attack pattern: radial shots every 2 seconds
                    const now = performance.now();
                    if (!lastAttackTime || now - lastAttackTime > 2000) {
                        const numShots = 8;
                        for (let i = 0; i < numShots; i++) {
                            const angleRad = (i / numShots) * Math.PI * 2;
                            const dx = Math.cos(angleRad) * 6;
                            const dy = Math.sin(angleRad) * 6;
                            setBullets(prevBullets => [
                                ...prevBullets,
                                {
                                    id: Date.now() + Math.random(),
                                    position: [position[0], position[1], 0],
                                    firedByPlayer: false,
                                    speed: 0, // Will be set below
                                    color: '#ec4899',
                                    velocity: [dx, dy, 0],
                                },
                            ]);
                        }
                        lastAttackTime = now;
                    }
                }
                return { ...prev, position, phase, angle, speedX, health, maxHealth, lastAttackTime };
            });
        }
        // --- Boss Removal ---
        if (boss && boss.health <= 0) {
            setBoss(null);
        }

        // --- Helper: Add Explosion ---
        const addExplosion = (position, color, count = 10) => {
            const newParticles = Array.from({ length: count }).map(() => ({
                id: Date.now() + Math.random(),
                position: [...position],
                color,
                size: 0.2 + Math.random() * 0.3,
                velocity: [
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 2
                ],
                lifespan: 0.7 + Math.random() * 0.6
            }));
            setParticles(prev => [...prev, ...newParticles]);
        };
        // --- Helper: Add Powerup ---
        const addPowerup = (position) => {
            // Randomly pick a type
            const types = ['shield', 'minion', 'ghost', 'bomb'];
            const type = types[Math.floor(Math.random() * types.length)];
            setPowerups(prev => [...prev, {
                id: Date.now() + Math.random(),
                position: [...position],
                type
            }]);
        };
        // --- Asteroid and Boss Collision Logic ---
        setAsteroids(prevAsteroids => prevAsteroids.map(asteroid => {
            let hit = false;
            setBullets(prevBullets => prevBullets.filter(bullet => {
                const dx = bullet.position[0] - asteroid.position[0];
                const dy = bullet.position[1] - asteroid.position[1];
                const dist = Math.hypot(dx, dy);
                if (dist < asteroid.size / 2 + 2.5) {
                    hit = true;
                    asteroid.health -= bullet.damage || 1;
                    return false;
                }
                return true;
            }));
            if (hit && asteroid.health <= 0) {
                addExplosion(asteroid.position, '#a1a1aa', 5);
                if (Math.random() < 0.3) addPowerup(asteroid.position);
            }
            return asteroid;
        }).filter(a => a.health > 0));

        // Boss collision with bullets
        if (boss) {
            let bossHit = false;
            setBullets(prevBullets => prevBullets.filter(bullet => {
                const dx = bullet.position[0] - boss.position[0];
                const dy = bullet.position[1] - boss.position[1];
                const dist = Math.hypot(dx, dy);
                if (dist < boss.size / 2 + 2.5) {
                    bossHit = true;
                    boss.health -= bullet.damage || 1;
                    return false;
                }
                return true;
            }));
            if (bossHit && boss.health <= 0) {
                addExplosion(boss.position, '#ec4899', 80);
                // Boss defeat rewards
                updateGameState(prev => ({ score: prev.score + 5000, waveCredits: prev.waveCredits + 1 }));
                setWaveCount(prev => prev + 1);
                // TODO: Add credits/materials to player
                // console.log('Boss defeated! Score +5000, wave advanced.');
            }
        }

        // --- Player update ---
        const mouseX = state.mouse.x * (viewport.width / 2);
        const mouseY = state.mouse.y * (viewport.height / 2);
        const player = playerInstance.current;
        if (player) {
          player.update(mouseX, mouseY, false, gameState.upgrades, gameState.gameFrame, bullets);
          player.tickCooldown();
          if (player.canShoot()) {
            player.shoot(bullets);
          }
          setPlayerState({
            x: player.x,
            y: player.y,
            health: player.health,
            shield: player.shield,
            bombs: player.bombs,
          });
        }

        // --- Enemy update ---
        const enemies = enemiesRef.current;
        const newEnemyBullets = [];
        for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i];
          // Example: simple downward movement
          enemy.position[1] -= (enemy.stats?.speedY || 1) * delta * 60;
          // Example: simple shooting
          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            newEnemyBullets.push({
              position: [enemy.position[0], enemy.position[1], 0],
              firedByPlayer: false,
              speed: -6,
              color: 'red',
              damage: 1,
            });
            enemy.shootCooldown = enemy.stats?.shootCooldown || 60;
          }
          // Remove if offscreen or dead
          if (enemy.health <= 0 || enemy.position[1] < -viewport.height / 2 - 5) {
            enemies.splice(i, 1);
          }
        }
        // Add new enemy bullets
        bullets.push(...newEnemyBullets);
    });

    // Handle game over screen logic
    useEffect(() => {
        if (gameState.currentScreen === 'gameOver') {
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
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.8} />
            <pointLight position={[0, 0, 5]} intensity={0.5} />
            
            {/* Render PlayerShip */}
            {gameState.currentScreen === 'playing' && (
                <GameEntity
                    position={[playerState.x, playerState.y, 0]}
                    geometry={gameState.currentUFO?.geometry || { type: 'SphereGeometry', args: [1, 16, 16] }}
                    color={gameState.currentUFO?.color || '#34d399'}
                />
            )}

            {/* Render Enemies */}
            {enemiesRef.current.map((enemy, i) => (
                <GameEntity
                    key={enemy.id || i}
                    position={enemy.position}
                    geometry={enemy.model?.geometry || { type: 'BoxGeometry', args: [1, 1, 1] }}
                    color={enemy.model?.color || '#f87171'}
                />
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

            {/* Render player bullets */}
            {bullets.filter(b => b.firedByPlayer).map((b, i) => (
                <Bullet key={b.id || i} position={b.position} speed={b.speed} color={b.color} firedByPlayer={true} />
            ))}

            {/* Render Bomb Pickups */}
            {bombPickups.map(pickup => (
                <BombPickup key={pickup.id} position={pickup.position} color={pickup.color} />
            ))}

            {/* Render Asteroids */}
            {asteroids.map(asteroid => (
                <GameEntity
                    key={asteroid.id}
                    geometry={asteroid.model.geometry}
                    colors={asteroid.model.colors}
                    position={new THREE.Vector3(...asteroid.position)}
                    scale={asteroid.size / 25}
                    enableRotation={true}
                />
            ))}

            {/* Render Boss */}
            {boss && (
                <GameEntity
                    key={boss.id}
                    geometry={boss.model.geometry}
                    colors={boss.model.colors}
                    position={new THREE.Vector3(...boss.position)}
                    scale={boss.size / 25}
                    enableRotation={true}
                />
            )}

            {/* Render Particles */}
            {particles.length > 0 && <ParticleSystem particles={particles} />}

            {/* Render Powerups */}
            {powerups.map(p => (
                <Powerup
                    key={p.id}
                    position={p.position}
                    type={p.type}
                    onCollect={() => setPowerups(prev => prev.filter(q => q.id !== p.id))}
                />
            ))}

            {/* Render Chronomancer/Reaper Sphere */}
            {abilityState.current.active &&
                (abilityState.current.name === 'chronomancer' || abilityState.current.name === 'reaper') &&
                playerRef.current && (
                    <mesh position={[playerRef.current.position.x, playerRef.current.position.y, 0]}>
                        <sphereGeometry args={[4, 24, 24]} />
                        <meshStandardMaterial
                            color={abilityState.current.name === 'reaper' ? '#9ca3af' : '#818cf8'}
                            transparent
                            opacity={0.2}
                        />
                    </mesh>
                )}

            {/* Render minions */}
            {playerInstance.current && playerInstance.current.minions.map((m, i) => (
                <GameEntity
                    key={`minion-${i}`}
                    position={[m.x, m.y, 0]}
                    geometry={{ type: 'SphereGeometry', args: [0.25, 8, 8] }}
                    color={'#a78bfa'}
                />
            ))}

            {/* Render enemy bullets */}
            {bullets.filter(b => !b.firedByPlayer).map((b, i) => (
                <Bullet key={b.id || i} position={b.position} speed={b.speed} color={b.color} firedByPlayer={false} />
            ))}
        </>
    );
}

export default GameScene;
