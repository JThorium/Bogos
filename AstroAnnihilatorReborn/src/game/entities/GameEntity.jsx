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
    // Ensure BufferGeometry variants are used
    switch (type) {
      case 'CylinderBufferGeometry':
        return new THREE.CylinderBufferGeometry(...args);
      case 'SphereBufferGeometry':
        return new THREE.SphereBufferGeometry(...args);
      case 'BoxBufferGeometry':
        return new THREE.BoxBufferGeometry(...args);
      case 'TetrahedronBufferGeometry':
        return new THREE.TetrahedronBufferGeometry(...args);
      case 'DodecahedronBufferGeometry':
        return new THREE.DodecahedronBufferGeometry(...args);
      case 'ConeBufferGeometry':
        return new THREE.ConeBufferGeometry(...args);
      case 'TorusBufferGeometry':
        return new THREE.TorusBufferGeometry(...args);
      case 'IcosahedronBufferGeometry':
        return new THREE.IcosahedronBufferGeometry(...args);
      // Add fallbacks for non-BufferGeometry names if needed, or ensure UFOData uses Buffer versions
      case 'CylinderGeometry':
        console.warn(`GameEntity: Using CylinderGeometry instead of CylinderBufferGeometry for ${type}`);
        return new THREE.CylinderBufferGeometry(...args);
      case 'SphereGeometry':
        console.warn(`GameEntity: Using SphereGeometry instead of SphereBufferGeometry for ${type}`);
        return new THREE.SphereBufferGeometry(...args);
      case 'BoxGeometry':
        console.warn(`GameEntity: Using BoxGeometry instead of BoxBufferGeometry for ${type}`);
        return new THREE.BoxBufferGeometry(...args);
      case 'TetrahedronGeometry':
        console.warn(`GameEntity: Using TetrahedronGeometry instead of TetrahedronBufferGeometry for ${type}`);
        return new THREE.TetrahedronBufferGeometry(...args);
      case 'DodecahedronGeometry':
        console.warn(`GameEntity: Using DodecahedronGeometry instead of DodecahedronBufferGeometry for ${type}`);
        return new THREE.DodecahedronBufferGeometry(...args);
      case 'ConeGeometry':
        console.warn(`GameEntity: Using ConeGeometry instead of ConeBufferGeometry for ${type}`);
        return new THREE.ConeBufferGeometry(...args);
      case 'TorusGeometry':
        console.warn(`GameEntity: Using TorusGeometry instead of TorusBufferGeometry for ${type}`);
        return new THREE.TorusBufferGeometry(...args);
      case 'IcosahedronGeometry':
        console.warn(`GameEntity: Using IcosahedronGeometry instead of IcosahedronBufferGeometry for ${type}`);
        return new THREE.IcosahedronBufferGeometry(...args);
      default:
        console.warn(`GameEntity: Unknown geometry type "${type}". Defaulting to BoxBufferGeometry.`);
        return new THREE.BoxBufferGeometry(0.5, 0.5, 0.5); // Fallback
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
