import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGame } from '../../game/GameProvider';
import GameEntity from './GameEntity';

// Helper function to get dimensions based on geometry type and args
const getUfoDimensions = (geometry) => {
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

const PlayerShip = React.forwardRef(({ onShoot }, ref) => {
  const { gameState, currentUFO } = useGame();
  const { viewport } = useThree();
  const [position, setPosition] = useState([0, 0, 0]);
  const lastShootTime = useRef(0);

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.userData.isPlayer = true;
    }
  }, [ref]);

  useFrame((state) => {
    if (gameState.currentScreen !== 'playing' || !currentUFO) return;

    // Movement
    const { width: ufoWidth, height: ufoHeight } = getUfoDimensions(currentUFO.geometry);
    const playerHalfSizeX = ufoWidth / 2;
    const playerHalfSizeY = ufoHeight / 2;
    const clampedX = Math.max(-viewport.width / 2 + playerHalfSizeX, Math.min(viewport.width / 2 - playerHalfSizeX, state.mouse.x * (viewport.width / 2)));
    const clampedY = Math.max(-viewport.height / 2 + playerHalfSizeY, Math.min(viewport.height / 2 - playerHalfSizeY, state.mouse.y * (viewport.height / 2)));
    setPosition([clampedX, clampedY, 0]);
    if (ref.current) {
        ref.current.position.set(clampedX, clampedY, 0);
    }


    // Autofire
    if (state.clock.elapsedTime - lastShootTime.current > currentUFO.stats.shotCooldown) {
      onShoot([clampedX, clampedY + ufoHeight / 2, 0]);
      lastShootTime.current = state.clock.elapsedTime;
    }
  });

  if (!currentUFO) return null;

  return (
    <GameEntity
      ref={ref}
      geometry={currentUFO.geometry}
      colors={currentUFO.colors}
      position={position}
    />
  );
});

export default PlayerShip;
