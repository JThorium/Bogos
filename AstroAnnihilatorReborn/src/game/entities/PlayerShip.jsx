import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from '../../game/GameProvider';
import GameEntity from './GameEntity';

export const getUfoDimensions = (geometry) => {
  if (!geometry || !geometry.type || !geometry.args) {
    return { width: 0.4, height: 0.4 }; // Default fallback
  }

  const { type, args } = geometry;
  let width = 0.4;
  let height = 0.4;

  switch (type) {
    case 'CylinderGeometry':
      // radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength
      width = Math.max(args[0] || 0.2, args[1] || 0.4) * 2; // Diameter
      height = args[2] || 0.1;
      break;
    case 'SphereGeometry':
      // radius, widthSegments, heightSegments
      width = args[0] * 2 || 0.4; // Diameter
      height = args[0] * 2 || 0.4; // Diameter
      break;
    case 'BoxGeometry':
      // width, height, depth
      width = args[0] || 0.4;
      height = args[1] || 0.4;
      break;
    case 'TetrahedronGeometry':
    case 'DodecahedronGeometry':
    case 'IcosahedronGeometry':
      // radius, detail
      width = args[0] * 2 || 0.4;
      height = args[0] * 2 || 0.4;
      break;
    case 'ConeGeometry':
      // radius, height
      width = args[0] * 2 || 0.4;
      height = args[1] || 0.5;
      break;
    case 'TorusGeometry':
      // radius, tube, radialSegments, tubularSegments, arc
      width = (args[0] + args[1]) * 2 || 0.6;
      height = args[1] * 2 || 0.2;
      break;
    default:
      // Fallback for unknown types
      width = 0.4;
      height = 0.4;
  }
  return { width, height };
};

const PlayerShip = React.forwardRef(({ onShoot, onAbilityHold }, ref) => {
  const { gameState, currentUFO } = useGame();
  const { viewport } = useThree();
  const lastShootTime = useRef(0);
  const isAbilityActive = useRef(false); // To track if ability is currently held/active

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.userData.isPlayer = true;
      // Set initial position
      ref.current.position.set(0, -viewport.height / 2 + 1, 0);
    }

    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left mouse button
        isAbilityActive.current = true;
      }
    };
    const handleMouseUp = (e) => {
      if (e.button === 0) { // Left mouse button
        isAbilityActive.current = false;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [ref, viewport]);

  useFrame((state) => {
    if (gameState.currentScreen !== 'playing' || !currentUFO) return;

    // Movement: Player UFO follows the mouse pointer 1:1
    const targetX = state.mouse.x * (viewport.width / 2);
    const targetY = state.mouse.y * (viewport.height / 2);
    
    if (ref.current) {
        ref.current.position.set(targetX, targetY, 0);
    }

    // Ability Activation (Hold Left Click)
    if (isAbilityActive.current) {
      // Trigger ability logic from GameScene via prop
      if (onAbilityHold) {
        onAbilityHold();
      }
    } else {
      // Autofire - use the actual Three.js object's position for bullet origin
      const { height: ufoHeight } = getUfoDimensions(currentUFO.geometry);
      if (state.clock.elapsedTime - lastShootTime.current > currentUFO.stats.shotCooldown) {
        if (ref.current) {
          onShoot([ref.current.position.x, ref.current.position.y + ufoHeight / 2, 0]);
          lastShootTime.current = state.clock.elapsedTime;
        }
      }
    }
  });

  if (!currentUFO) return null;

  return (
    <GameEntity
      ref={ref}
      geometry={currentUFO.geometry}
      colors={currentUFO.colors}
      // Position is now managed directly by ref.current in useFrame
      // Initial position can be set in useEffect or left to default [0,0,0] if not critical
    />
  );
});

export default PlayerShip;
