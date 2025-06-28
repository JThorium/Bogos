import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function GameEntity({ position = [0, 0, 0], color = 'gray', shape = 'box', args = [1, 1, 1], enableRotation = false }) {
  const mesh = useRef();

  useFrame(() => {
    if (mesh.current && enableRotation) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
    }
  });

  const Geometry = shape === 'box' ? 'boxGeometry' : 'sphereGeometry';

  return (
    <mesh ref={mesh} position={position}>
      <Geometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default GameEntity;
