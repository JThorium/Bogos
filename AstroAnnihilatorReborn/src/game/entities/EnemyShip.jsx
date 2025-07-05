import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import GameEntity from './GameEntity';
import * as THREE from 'three';

// Function to invert RGB colors (assuming colors are 0-1 range)
const invertColors = (colors) => {
  if (!colors || colors.length < 3) return [1, 1, 1];
  return [1 - colors[0], 1 - colors[1], 1 - colors[2]];
};

function EnemyShip({ enemy, onEnemyShoot, playerPosition, onSplitterDeath }) {
  // enemy: { position, type, model, stats, health, phase, shootCooldown, ... }
  const mesh = useRef();
  const { viewport } = useThree();
  const lastShootTime = useRef(0);
  const phase = useRef(enemy.phase || 0);

  // Use instance stats
  const { position, type, model, stats } = enemy;
  const invertedColorsArray = invertColors(model.colors);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.02;
      phase.current++;
      let currentPosition = mesh.current.position;
<<<<<<< HEAD
      // Movement patterns
      switch (type) {
        case 'grunt':
          currentPosition.x += stats.speedX * delta;
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            stats.speedX *= -1;
=======

      switch (ufoData.id) { // Using ufoData.id as type
        case 'scout': // grunt
          currentPosition.x += (ufoData.stats.moveSpeed || 0.5) * delta * (ufoData.speed || 1); // Use ufoData.speed for x-movement
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            if (ufoData.speed) ufoData.speed *= -1; // Reverse direction
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
          }
          break;
        case 'tank':
          // No special x movement
          break;
        case 'dasher':
          // No special x movement
          break;
<<<<<<< HEAD
        case 'weaver':
          currentPosition.x += Math.sin(phase.current * 0.1) * stats.speedX * delta;
          break;
        case 'dodger':
          if (playerPosition) {
            const dx = playerPosition[0] - currentPosition.x;
            if (Math.abs(dx) < 100) currentPosition.x -= Math.sign(dx) * 2 * delta;
=======
        case 'ufo5': // weaver - sine wave movement
          currentPosition.x += Math.sin(phase.current * 0.1) * (ufoData.stats.moveSpeed || 0.5) * delta;
          break;
        case 'ufo6': // dodger - evade player (needs player position)
          // const dx = player.x - currentPosition.x;
          // if (Math.abs(dx) < 100) currentPosition.x -= Math.sign(dx) * 2 * delta;
          break;
        case 'ufo7': // orbiter - stops at targetY, then moves horizontally
          // if (currentPosition.y > ufoData.targetY) { // targetY needs to be defined in ufoData
          //   currentPosition.y = ufoData.targetY;
          //   ufoData.speed = 0; // Stop vertical movement
          //   currentPosition.x += Math.cos(phase.current * 0.05) * 2 * delta;
          // }
          break;
        case 'ufo8': // kamikaze - homes in on player (needs player position)
          // const angle = Math.atan2(player.y - currentPosition.y, player.x - currentPosition.x);
          // currentPosition.x += Math.cos(angle) * ufoData.stats.moveSpeed * delta;
          // currentPosition.y += Math.sin(angle) * ufoData.stats.moveSpeed * delta;
          break;
        case 'ufo9': // sniper - similar to grunt
          currentPosition.x += (ufoData.stats.moveSpeed || 0.5) * delta * (ufoData.speed || 1);
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            if (ufoData.speed) ufoData.speed *= -1;
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
          }
          break;
        case 'orbiter':
          if (currentPosition.y > stats.targetY) {
            currentPosition.y = stats.targetY;
            stats.speedY = 0;
            currentPosition.x += Math.cos(phase.current * 0.05) * 2 * delta;
          }
          break;
        case 'kamikaze':
          if (playerPosition) {
            const angle = Math.atan2(playerPosition[1] - currentPosition.y, playerPosition[0] - currentPosition.x);
            currentPosition.x += Math.cos(angle) * stats.speedY * delta;
            currentPosition.y += Math.sin(angle) * stats.speedY * delta;
          }
          break;
        case 'sniper':
          currentPosition.x += stats.speedX * delta;
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            stats.speedX *= -1;
          }
          break;
        case 'splitter':
          // No special x movement
          break;
        case 'stealth':
          currentPosition.x += stats.speedX * delta;
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            stats.speedX *= -1;
          }
          // TODO: Implement transparency in material
          break;
        default:
<<<<<<< HEAD
          currentPosition.x += stats.speedX * delta;
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            stats.speedX *= -1;
          }
          break;
      }
      // Shooting logic (simple cooldown)
      if (onEnemyShoot && state.clock.elapsedTime - lastShootTime.current > stats.shootCooldown / 60) {
        const { height: enemyHeight } = getUfoDimensions(model.geometry);
        // For now, just fire a single bullet downward
        onEnemyShoot([currentPosition.x, currentPosition.y - enemyHeight / 2, 0]);
=======
          // Default movement if no specific type is matched
          currentPosition.x += (ufoData.stats.moveSpeed || 0.5) * delta * (ufoData.speed || 1);
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            if (ufoData.speed) ufoData.speed *= -1;
          }
          break;
      }

      // Enemy Autofire
      if (onEnemyShoot && state.clock.elapsedTime - lastShootTime.current > (effectiveUfoData.stats.shotCooldown || 1)) {
        const { height: ufoHeight } = getUfoDimensions(effectiveUfoData.geometry);
        // Implement specific shooting patterns based on enemy type
        switch (ufoData.shoot || 'single') {
          case 'single':
            onEnemyShoot([currentPosition.x, currentPosition.y - ufoHeight / 2, 0]);
            break;
          case 'spread':
            for (let i = -1; i <= 1; i++) {
              onEnemyShoot([currentPosition.x + i * 0.2, currentPosition.y - ufoHeight / 2, 0]);
            }
            break;
          case 'homing':
            onEnemyShoot([currentPosition.x, currentPosition.y - ufoHeight / 2, 0]); // Homing bullet logic will be in GameScene
            break;
          case 'burst':
            // Fire multiple bullets in quick succession
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                onEnemyShoot([currentPosition.x, currentPosition.y - ufoHeight / 2, 0]);
              }, i * 100); // Small delay between bullets
            }
            break;
          case 'laser':
            // Single powerful shot, maybe wider
            onEnemyShoot([currentPosition.x, currentPosition.y - ufoHeight / 2, 0]);
            break;
          case 'wave':
            // Bullets move in a wave pattern
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI - Math.PI / 2; // Fan out
              onEnemyShoot([currentPosition.x + Math.sin(angle) * 0.5, currentPosition.y - ufoHeight / 2 + Math.cos(angle) * 0.5, 0]);
            }
            break;
          case 'explosive':
            onEnemyShoot([currentPosition.x, currentPosition.y - ufoHeight / 2, 0]); // Bullet explodes on impact
            break;
          case 'triple':
            onEnemyShoot([currentPosition.x - 0.3, currentPosition.y - ufoHeight / 2, 0]);
            onEnemyShoot([currentPosition.x, currentPosition.y - ufoHeight / 2, 0]);
            onEnemyShoot([currentPosition.x + 0.3, currentPosition.y - ufoHeight / 2, 0]);
            break;
          case 'arc':
            for (let i = -2; i <= 2; i++) {
              const angle = i * 0.3; // Arc spread
              onEnemyShoot([currentPosition.x + Math.sin(angle) * 0.5, currentPosition.y - ufoHeight / 2 + Math.cos(angle) * 0.5, 0]);
            }
            break;
          case 'spiral':
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2 + phase.current * 0.1;
              onEnemyShoot([currentPosition.x + Math.cos(angle) * 0.5, currentPosition.y + Math.sin(angle) * 0.5, 0]);
            }
            break;
          default:
            onEnemyShoot([currentPosition.x, currentPosition.y - ufoHeight / 2, 0]);
            break;
        }
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
        lastShootTime.current = state.clock.elapsedTime;
      }
      // Splitter logic: if health <= 0, spawn 3 grunts
      if (type === 'splitter' && enemy.health <= 0 && onSplitterDeath) {
        onSplitterDeath(currentPosition);
      }
    }
  });

  return (
<<<<<<< HEAD
    <GameEntity
      ref={mesh}
      geometry={model.geometry}
      colors={invertedColorsArray}
      position={new THREE.Vector3(...position)}
      enableRotation={false}
=======
    <GameEntity 
      ref={mesh} 
      geometry={effectiveUfoData.geometry}
      colors={invertedColorsArray} 
      position={position} // Pass position array directly
      enableRotation={false} 
>>>>>>> 7fe7e9491e8d5350fb7b344e1a3549bd2afe174e
    />
  );
}

export default EnemyShip;

const getUfoDimensions = (geometry) => {
  if (!geometry || !geometry.type || !geometry.args) {
    return { width: 0.4, height: 0.4 };
  }
  const { type, args } = geometry;
  let width = 0.4;
  let height = 0.4;
  switch (type) {
    case 'CylinderGeometry':
      width = Math.max(args[0] || 0.2, args[1] || 0.4) * 2;
      height = args[2] || 0.1;
      break;
    case 'SphereGeometry':
      width = args[0] * 2 || 0.4;
      height = args[0] * 2 || 0.4;
      break;
    case 'BoxGeometry':
      width = args[0] || 0.4;
      height = args[1] || 0.4;
      break;
    case 'TetrahedronGeometry':
    case 'DodecahedronGeometry':
    case 'IcosahedronGeometry':
      width = args[0] * 2 || 0.4;
      height = args[0] * 2 || 0.4;
      break;
    case 'ConeGeometry':
      width = args[0] * 2 || 0.4;
      height = args[1] || 0.5;
      break;
    case 'TorusGeometry':
      width = (args[0] + args[1]) * 2 || 0.6;
      height = args[1] * 2 || 0.2;
      break;
    default:
      width = 0.4;
      height = 0.4;
  }
  return { width, height };
};
