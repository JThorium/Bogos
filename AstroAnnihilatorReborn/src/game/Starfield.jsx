import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

function Starfield({ count = 5000 }) {
  const mesh = useRef();

  const stars = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      // Only move along Y-axis for scrolling effect
      mesh.current.position.y -= 0.1; // Increased speed slightly for better effect
      
      // Reset position to create infinite scrolling effect
      // When a star goes off the bottom of the screen, move it to the top
      // The camera is at Z=15, and the scene is centered at 0,0,0.
      // The visible height of the viewport needs to be considered.
      const viewportHeight = state.viewport.height;
      if (mesh.current.position.y < -viewportHeight / 2) {
        mesh.current.position.y = viewportHeight / 2;
      }
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stars.length / 3}
          array={stars}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="white" size={0.1} sizeAttenuation={true} transparent opacity={0.8} />
    </points>
  );
}

export default Starfield;
