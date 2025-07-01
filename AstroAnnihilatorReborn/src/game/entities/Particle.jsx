// 2024-06-09T22:05Z: 3D Particle component for explosion/visual effects. Self-removes after lifespan.
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particle({ position, color = '#fff', size = 0.2, velocity = [0, 0, 0], lifespan = 1, onExpire }) {
  const meshRef = useRef();
  const life = useRef(lifespan);
  const pos = useRef([...position]);

  useFrame((_, delta) => {
    if (life.current <= 0) {
      if (onExpire) onExpire();
      return;
    }
    life.current -= delta;
    pos.current[0] += velocity[0] * delta;
    pos.current[1] += velocity[1] * delta;
    pos.current[2] += velocity[2] * delta;
    if (meshRef.current) {
      meshRef.current.position.set(...pos.current);
      meshRef.current.material.opacity = Math.max(0, life.current / lifespan);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={1} />
    </mesh>
  );
}

// ParticleSystem: performant instanced mesh for many particles
export function ParticleSystem({ particles }) {
  const meshRef = useRef();
  const colorArray = useMemo(() => new Float32Array(particles.length * 3), [particles.length]);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      // Update position
      p.position[0] += p.velocity[0] * delta;
      p.position[1] += p.velocity[1] * delta;
      p.position[2] += p.velocity[2] * delta;
      // Update matrix
      const m = new THREE.Matrix4();
      m.makeTranslation(p.position[0], p.position[1], p.position[2]);
      meshRef.current.setMatrixAt(i, m);
      // Update color
      const c = new THREE.Color(p.color || '#fff');
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
      // Update opacity (not supported per-instance in meshStandardMaterial, but can be done with custom shader if needed)
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  });
  return (
    <instancedMesh ref={meshRef} args={[null, null, particles.length]}>
      <sphereGeometry args={[0.2, 8, 8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshStandardMaterial vertexColors transparent opacity={1} />
    </instancedMesh>
  );
}

export default Particle; 