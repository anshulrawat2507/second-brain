'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCube({ position, size = 0.3, speed = 1 }) {
  const meshRef = useRef(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial 
          color="#513180" 
          wireframe 
          transparent 
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function Grid() {
  const gridRef = useRef(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
    }
  });

  return (
    <gridHelper 
      ref={gridRef}
      args={[30, 30, '#513180', '#2a1a40']} 
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function ParticleField() {
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const pointsRef = useRef(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#513180" 
        transparent 
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#513180" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      <ParticleField />
      <Grid />
      
      {/* Floating cubes */}
      <FloatingCube position={[-3, 1, -2]} size={0.4} speed={0.8} />
      <FloatingCube position={[3, -1, -3]} size={0.3} speed={1.2} />
      <FloatingCube position={[0, 2, -4]} size={0.5} speed={0.6} />
      <FloatingCube position={[-2, -1.5, -1]} size={0.25} speed={1.5} />
      <FloatingCube position={[2.5, 0.5, -2]} size={0.35} speed={1} />
    </>
  );
}

export function RetroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
