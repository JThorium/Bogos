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


function PlayerShip({ onShoot }) {
  const { gameState, updateGameState, currentUFO } = useGame();
  const { size, viewport } = useThree();
  const [position, setPosition] = useState([0, 0, 0]);
  const playerMeshRef = useRef();

  const shootCooldown = currentUFO ? currentUFO.stats.shotCooldown : 0.2;
  const lastShootTime = useRef(0);

  // Set initial position and mark as player
  useEffect(() => {
    if (size.height && currentUFO && currentUFO.geometry) {
      if (playerMeshRef.current) {
        playerMeshRef.current.userData.isPlayer = true;
      }
      const { height: ufoHeight } = getUfoDimensions(currentUFO.geometry);
      setPosition([0, -viewport.height / 2 + ufoHeight / 2 + 0.5, 0]);
    }
  }, [size.height, viewport.height, currentUFO]);

  const handleClick = (event) => {
    if (gameState.currentScreen === 'mainMenu') {
      updateGameState({ currentScreen: 'playing' });
      event.stopPropagation();
    }
  };

  useFrame((state) => {
    if (gameState.currentScreen === 'playing' && currentUFO && currentUFO.geometry) {
      const { height: ufoHeight } = getUfoDimensions(currentUFO.geometry);
      // Autofire logic
      if (state.clock.elapsedTime - lastShootTime.current > shootCooldown) {
        onShoot([position[0], position[1] + ufoHeight / 2 + 0.1, position[2]]);
        lastShootTime.current = state.clock.elapsedTime;
      }

      // Map normalized mouse coordinates (-1 to 1) to world coordinates
      const x = state.mouse.x * (viewport.width / 2);
      const y = state.mouse.y * (viewport.height / 2);
      
      // Player size is dynamic based on currentUFO
      const { width: ufoWidth, height: ufoHeightForClamping } = getUfoDimensions(currentUFO.geometry);
      const playerHalfSizeX = ufoWidth / 2;
      const playerHalfSizeY = ufoHeightForClamping / 2;

      // Clamping to ensure player stays within screen bounds
      const clampedX = Math.max(-viewport.width / 2 + playerHalfSizeX, Math.min(viewport.width / 2 - playerHalfSizeX, x));
      const clampedY = Math.max(-viewport.height / 2 + playerHalfSizeY, Math.min(viewport.height / 2 - playerHalfSizeY, y));

      setPosition([clampedX, clampedY, 0]);
    }
  });

  if (!currentUFO) return null;

  return (
    <GameEntity 
      ref={playerMeshRef}
      geometry={currentUFO.geometry}
      colors={currentUFO.colors}
      position={position} 
      onClick={handleClick}
    />
  );
}

export default PlayerShip;
