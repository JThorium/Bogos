import React, { useRef, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GameEntity = forwardRef(({ position = [0, 0, 0], color = 'gray', enableRotation = false, geometry, colors }, ref) => {
  const internalRef = useRef();
  const meshRef = ref || internalRef;

  useFrame(() => {
    if (meshRef.current && enableRotation) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  // Dynamically create the THREE.Geometry instance based on the geometry prop
  // Dynamically create the THREE.Geometry instance based on the geometry prop
  const createdGeometry = useMemo(() => {
    if (!geometry || !geometry.type || !geometry.args) {
      return new THREE.BoxGeometry(0.5, 0.5, 0.5); // Default to a box if invalid
    }

    const { type, args } = geometry;
    switch (type) {
      case 'CylinderGeometry':
        return new THREE.CylinderGeometry(...args);
      case 'SphereGeometry':
        return new THREE.SphereGeometry(...args);
      case 'BoxGeometry':
        return new THREE.BoxGeometry(...args);
      case 'TetrahedronGeometry':
        return new THREE.TetrahedronGeometry(...args);
      case 'DodecahedronGeometry':
        return new THREE.DodecahedronGeometry(...args);
      case 'ConeGeometry':
        return new THREE.ConeGeometry(...args);
      case 'TorusGeometry':
        return new THREE.TorusGeometry(...args);
      case 'IcosahedronGeometry':
        return new THREE.IcosahedronGeometry(...args);
      default:
        return new THREE.BoxGeometry(0.5, 0.5, 0.5); // Fallback
    }
  }, [geometry]);

  // Determine the material color
  const materialColor = useMemo(() => {
    if (colors && colors.length >= 3) {
      // Assuming colors are normalized RGB components [r, g, b]
      return new THREE.Color(colors[0], colors[1], colors[2]);
    }
    return new THREE.Color(color); // Fallback to default color prop
  }, [colors, color]);

  return (
    <mesh ref={meshRef} position={position}>
      <primitive object={createdGeometry} attach="geometry" />
      <meshStandardMaterial color={materialColor} />
    </mesh>
  );
});

export default GameEntity;
