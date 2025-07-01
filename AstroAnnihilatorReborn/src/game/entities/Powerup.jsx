// 2024-06-09T22:15Z: 3D Powerup component for collectible powerups.
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const POWERUP_COLORS = {
  shield: '#60a5fa',
  minion: '#a78bfa',
  ghost: '#e5e7eb',
  bomb: '#ffffff',
  material: '#94a3b8',
};

function Powerup({ position, type = 'shield', onCollect }) {
  const meshRef = useRef();
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.03;
    }
  });
  return (
    <mesh ref={meshRef} position={position} onClick={onCollect}>
      <sphereGeometry args={[0.35, 12, 12]} />
      <meshStandardMaterial color={POWERUP_COLORS[type] || '#fff'} emissive={POWERUP_COLORS[type] || '#fff'} />
    </mesh>
  );
}

export default Powerup; 