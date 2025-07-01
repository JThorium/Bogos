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
      // Movement patterns
      switch (type) {
        case 'grunt':
          currentPosition.x += stats.speedX * delta;
          if (currentPosition.x < -viewport.width / 2 || currentPosition.x > viewport.width / 2) {
            stats.speedX *= -1;
          }
          break;
        case 'tank':
          // No special x movement
          break;
        case 'dasher':
          // No special x movement
          break;
        case 'weaver':
          currentPosition.x += Math.sin(phase.current * 0.1) * stats.speedX * delta;
          break;
        case 'dodger':
          if (playerPosition) {
            const dx = playerPosition[0] - currentPosition.x;
            if (Math.abs(dx) < 100) currentPosition.x -= Math.sign(dx) * 2 * delta;
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
        lastShootTime.current = state.clock.elapsedTime;
      }
      // Splitter logic: if health <= 0, spawn 3 grunts
      if (type === 'splitter' && enemy.health <= 0 && onSplitterDeath) {
        onSplitterDeath(currentPosition);
      }
    }
  });

  return (
    <GameEntity
      ref={mesh}
      geometry={model.geometry}
      colors={invertedColorsArray}
      position={new THREE.Vector3(...position)}
      enableRotation={false}
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
