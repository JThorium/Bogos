import React, { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'; // Import THREE for Color

const GameEntity = forwardRef(({ position = [0, 0, 0], color = 'gray', shape = 'box', args = [1, 1, 1], enableRotation = false, geometry, colors }, ref) => {
  const internalRef = useRef();
  const meshRef = ref || internalRef;

  useFrame(() => {
    if (meshRef.current && enableRotation) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const Geometry = shape === 'box' ? 'boxGeometry' : 'sphereGeometry';

  return (
    <mesh ref={meshRef} position={position}>
      {geometry ? <primitive object={geometry} /> : <Geometry args={args} />}
      {/* Use the first three values of colors array for RGB, or fallback to default color */}
      <meshStandardMaterial color={colors && colors.length >= 3 ? new THREE.Color(colors[0], colors[1], colors[2]) : color} />
    </mesh>
  );
});

export default GameEntity;
