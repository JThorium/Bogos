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

function Minion({ parentPosition, index, total, abilityActive, onMinionShoot }) {
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const meshRef = useRef();
  const shootCooldown = useRef(abilityActive ? 45 : 75);

  useFrame((_, delta) => {
    angleRef.current += 0.03;
    const orbitRadius = 2.5;
    const orbitAngle = angleRef.current + (index * (Math.PI * 2 / total));
    const x = parentPosition[0] + Math.cos(orbitAngle) * orbitRadius;
    const y = parentPosition[1] + Math.sin(orbitAngle) * orbitRadius;
    if (meshRef.current) {
      meshRef.current.position.set(x, y, 0);
    }
    // Shooting logic
    shootCooldown.current -= delta * 60; // Convert delta to frames
    if (shootCooldown.current <= 0) {
      if (onMinionShoot) {
        onMinionShoot({
          position: [x, y, 0],
          homing: abilityActive,
        });
      }
      shootCooldown.current = abilityActive ? 45 : 75;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.25, 8, 8]} />
      <meshStandardMaterial color={'#a78bfa'} />
    </mesh>
  );
}

function Sentry({ parentPosition, onSentryShoot }) {
  const meshRef = useRef();
  const shootCooldown = useRef(20);
  useFrame((_, delta) => {
    // Follow player
    if (meshRef.current) {
      meshRef.current.position.x += (parentPosition[0] - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y += (parentPosition[1] - 2 - meshRef.current.position.y) * 0.05;
    }
    // Shooting logic
    shootCooldown.current -= delta * 60;
    if (shootCooldown.current <= 0) {
      if (onSentryShoot && meshRef.current) {
        onSentryShoot({
          position: [meshRef.current.position.x, meshRef.current.position.y, 0],
          firedByPlayer: true,
          color: '#f97316',
          speed: 8,
        });
      }
      shootCooldown.current = 20;
    }
  });
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={'#f97316'} />
    </mesh>
  );
}

const PlayerShip = React.forwardRef(({ onShoot, onAbilityHold, addBullet }, ref) => {
  const { gameState, updateGameState, currentUFO } = useGame();
  if (!currentUFO) return null;
  const { viewport } = useThree();
  const lastShootTime = useRef(0);
  const isAbilityActive = useRef(false);
  const abilityState = useRef({ ...gameState.abilityState });
  const [minions, setMinions] = useState(gameState.minions || []);
  const [bombs, setBombs] = useState(gameState.playerBombs || 0);
  const [shield, setShield] = useState(gameState.playerShield || 0);
  const [reaperBoost, setReaperBoost] = useState(gameState.reaperBoost || 0);
  const [phoenixUsed, setPhoenixUsed] = useState(gameState.phoenixUsed || false);
  const [fusionAbilities, setFusionAbilities] = useState([]);
  const [fusionCycleIndex, setFusionCycleIndex] = useState(0);
  const [sentries, setSentries] = useState([]);

  // --- Ability Activation & Cycling ---
  useEffect(() => {
    // Determine available abilities for fusion/Chimera
    if (gameState.gameMode === 'fusion' && gameState.fusionConfig.length > 0) {
      setFusionAbilities(gameState.fusionConfig);
    } else if (gameState.isCombineAllActive) {
      setFusionAbilities(Object.keys(gameState.upgrades)); // All abilities
    } else {
      setFusionAbilities([currentUFO.id]);
    }
  }, [gameState.gameMode, gameState.fusionConfig, gameState.isCombineAllActive, currentUFO]);

  // --- Ability Hold/Release Logic ---
  useFrame((state) => {
    if (gameState.currentScreen !== 'playing' || !currentUFO) return;
    // Movement
    const targetX = state.mouse.x * (viewport.width / 2);
    const targetY = state.mouse.y * (viewport.height / 2);
    if (ref.current) {
      ref.current.position.set(targetX, targetY, 0);
    }
    // Ability cycling (for fusion/Chimera)
    if (isAbilityActive.current && fusionAbilities.length > 1) {
      // Cycle ability every 30 frames while held
      if (state.clock.frame % 30 === 0) {
        setFusionCycleIndex((i) => (i + 1) % fusionAbilities.length);
      }
    }
    // Ability activation
    let abilityToUse = fusionAbilities.length > 1 ? fusionAbilities[fusionCycleIndex] : currentUFO.id;
    if (isAbilityActive.current) {
      if (!abilityState.current.active && abilityState.current.cooldown <= 0) {
        abilityState.current.active = true;
        abilityState.current.name = abilityToUse;
        abilityState.current.duration = 0;
      }
      abilityState.current.duration++;
      // TODO: Per-ability effects
    } else {
      if (abilityState.current.active) {
        // Ability release logic
        abilityState.current.active = false;
        abilityState.current.cooldown = 60; // Example cooldown
        // TODO: Per-ability release effects
      }
      // Autofire
      const { height: ufoHeight } = getUfoDimensions(currentUFO.geometry);
      if (state.clock.elapsedTime - lastShootTime.current > currentUFO.stats.shotCooldown) {
        if (ref.current) {
          onShoot([ref.current.position.x, ref.current.position.y + ufoHeight / 2, 0]);
          lastShootTime.current = state.clock.elapsedTime;
        }
      }
    }
    // Sync state
    updateGameState({
      abilityState: { ...abilityState.current },
      minions,
      playerBombs: bombs,
      playerShield: shield,
      reaperBoost,
      phoenixUsed,
    });

    // In ability activation logic (useFrame), spawn sentry on Engineer ability
    if (isAbilityActive.current && abilityToUse === 'engineer' && !abilityState.current.active && abilityState.current.cooldown <= 0) {
      setSentries(prev => [...prev, { id: Date.now() + Math.random() }]);
    }
  });

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.userData.isPlayer = true;
      ref.current.position.set(0, -viewport.height / 2 + 1, 0);
    }
    const handleMouseDown = (e) => { if (e.button === 0) isAbilityActive.current = true; };
    const handleMouseUp = (e) => { if (e.button === 0) isAbilityActive.current = false; };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [ref, viewport]);

  useEffect(() => {
    setMinions(gameState.minions || []);
  }, [gameState.minions]);

  return (
    <>
      <GameEntity
        ref={ref}
        geometry={currentUFO.geometry}
        colors={currentUFO.colors}
      />
      {minions.map((minion, i) => (
        <Minion
          key={minion.id}
          parentPosition={ref.current ? [ref.current.position.x, ref.current.position.y] : [0, 0]}
          index={i}
          total={minions.length}
          abilityActive={abilityState.current.active && abilityState.current.name === 'destroyer'}
          onMinionShoot={addBullet}
        />
      ))}
      {/* Render Sentry if Engineer ability active */}
      {abilityState.current.active && abilityState.current.name === 'engineer' && ref.current && (
        <Sentry
          parentPosition={[ref.current.position.x, ref.current.position.y]}
          onSentryShoot={addBullet}
        />
      )}
      {sentries.map((s, i) => (
        <Sentry
          key={s.id}
          parentPosition={ref.current ? [ref.current.position.x, ref.current.position.y] : [0, 0]}
          onSentryShoot={addBullet}
        />
      ))}
    </>
  );
});

export default PlayerShip;
