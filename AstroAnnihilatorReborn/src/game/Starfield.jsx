import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Starfield({ count = 500 }) { // Reduced count for better performance
  const mesh = useRef();
  const { viewport } = useThree();

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spawn stars across the visible screen area
      positions[i * 3] = (Math.random() - 0.5) * viewport.width * 2; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2; // Y
      positions[i * 3 + 2] = 0; // Fixed Z for a flat, 2D feel
    }
    return positions;
  }, [count, viewport.width, viewport.height]);

  useFrame(() => {
    if (mesh.current) {
      const positionsArray = mesh.current.geometry.attributes.position.array;
      const speed = 0.08; // Consistent speed for all stars

      for (let i = 0; i < count; i++) {
        // Move star downwards
        positionsArray[i * 3 + 1] -= speed;

        // If star goes below the screen, reset it to the top with new random X and Y
        if (positionsArray[i * 3 + 1] < -viewport.height / 2 - 5) { // Reset just below viewport
          positionsArray[i * 3 + 1] = viewport.height / 2 + 5; // Reset just above viewport
          positionsArray[i * 3] = (Math.random() - 0.5) * viewport.width * 3; // Wider random X spread
        }
      }
      mesh.current.geometry.attributes.position.needsUpdate = true; // Important for updating BufferGeometry
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      {/* Simple, uniform stars */}
      <pointsMaterial color="white" size={0.4} sizeAttenuation={false} transparent opacity={0.8} depthWrite={false} renderOrder={1000} /> {/* Increased size */}
    </points>
  );
}

export default Starfield;
