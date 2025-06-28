import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const UFOModel = ({ geometryType, geometryArgs, colors }) => {
  const meshRef = useRef();

  // Removed automatic rotation for a static preview
  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.01;
  //     meshRef.current.rotation.x += 0.005;
  //   }
  // });

  const generateGeometry = (type, args) => {
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
        return new THREE.BoxGeometry(0.5, 0.5, 0.5); // Default to a box if type is unknown
    }
  };

  const geometry = generateGeometry(geometryType, geometryArgs);

  const materialColors = colors ? colors.map(c => new THREE.Color(c, c, c)) : [new THREE.Color('white')];

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {materialColors.length === 1 ? (
        <meshStandardMaterial color={materialColors[0]} />
      ) : (
        // Example for multiple colors, you might need a more sophisticated material setup
        // depending on how 'colors' array is intended to be used (e.g., for different faces)
        // For now, it will just use the first color if multiple are provided.
        <meshStandardMaterial color={materialColors[0]} />
      )}
    </mesh>
  );
};

const UFOPreview = ({ ufoData }) => {
  if (!ufoData) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500">Select a UFO for preview</div>;
  }

  return (
    <Canvas camera={{ position: [0, 0, 1.5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <UFOModel
        geometryType={ufoData.geometry.type}
        geometryArgs={ufoData.geometry.args}
        colors={ufoData.colors}
      />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};

export default UFOPreview;
