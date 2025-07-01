import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import GameEntity from './GameEntity';
import { ufos } from '../UFOData';
import * as THREE from 'three';

// Function to invert RGB colors (assuming colors are 0-1 range)
const invertColors = (colors) => {
  if (!colors || colors.length < 3) return [1, 1, 1]; // Default to white if no colors
  // Invert the first three components (R, G, B)
  return [1 - colors[0], 1 - colors[1], 1 - colors[2]];
};

function EnemyShip({ position, ufoData, onEnemyShoot }) { // Accept ufoData and onEnemyShoot prop
  const mesh = useRef();
  const { viewport } = useThree(); // Use useThree to get viewport for rotation logic
  const lastShootTime = useRef(0);

  // Use ufoData prop directly, fall back to a default if not provided
  const effectiveUfoData = ufoData || ufos.find(ufo => ufo.id === 'ufo4'); 
  const invertedColorsArray = invertColors(effectiveUfoData.colors);
  const slowTimer = useRef(0);
  const phase = useRef(0);

  useFrame((state, delta) => {
    if (mesh.current) {
      // Apply rotation based on type (from old HTML logic)
      mesh.current.rotation.x += 0.01; // Example rotation, can be customized per enemy type
      mesh.current.rotation.y += 0.02; // Example rotation

      // Implement specific movement patterns based on enemy type
      let speedMod = 1; // Placeholder for slow effect
      // TODO: Integrate actual slow effect from player ability (Chronomancer)
      // if (player && player.abilityState.name === 'chronomancer' && player.abilityState.active && Math.hypot(this.x-player.x, this.y-player.y) < 200) { timeMod = 0.2; }

      phase.current++;
      let currentPosition = mesh.current.position;

      switch (ufoData.id) { // Using ufoData.id as type
        case 'scout': // grunt
          currentPosition.x += (ufoData.stats.moveSpeed || 0.5) * delta * (ufoData.speed || 1); // Use ufoData.speed for x-movement
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            if (ufoData.speed) ufoData.speed *= -1; // Reverse direction
          }
          break;
        case 'destroyer': // tank - no special x movement
          break;
        case 'ufo4': // dasher - no special x movement
          break;
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
          }
          break;
        case 'ufo10': // splitter - no special x movement
          break;
        case 'ufo11': // stealth - transparency effect
          // TODO: Implement transparency in material
          break;
        default:
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
        lastShootTime.current = state.clock.elapsedTime;
      }
    }
  });

  return (
    <GameEntity 
      ref={mesh} 
      geometry={effectiveUfoData.geometry}
      colors={invertedColorsArray} 
      position={position} // Pass position array directly
      enableRotation={false} 
    />
  );
}

export default EnemyShip;

// Helper function to get dimensions based on geometry type and args (copied from PlayerShip for reusability)
const getUfoDimensions = (geometry) => {
  if (!geometry || !geometry.type || !geometry.args) {
    return { width: 0.4, height: 0.4 }; // Default fallback
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
