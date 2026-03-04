'use client';

import { useRef, useMemo, useState, useEffect, createContext, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Theme context for Three.js scene
const ThreeThemeContext = createContext({ accent: '#513180', grid: '#1a0a2e' });

// Subtle floating particles for ambient effect
function AmbientParticles() {
  const { accent } = useContext(ThreeThemeContext);
  const count = 50;
  const pointsRef = useRef(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
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
        size={0.03} 
        color={accent} 
        transparent 
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Glowing orb that pulses
function GlowingOrb({ position }) {
  const { accent } = useContext(ThreeThemeContext);
  const meshRef = useRef(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial 
        color={accent} 
        transparent 
        opacity={0.15}
      />
    </mesh>
  );
}

// Subtle grid lines
function SubtleGrid() {
  const { grid } = useContext(ThreeThemeContext);
  const gridRef = useRef(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.1) % 1;
    }
  });

  return (
    <gridHelper 
      ref={gridRef}
      args={[40, 40, grid, grid]} 
      position={[0, -5, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}

// Connection lines between points
function ConnectionLines() {
  const { accent } = useContext(ThreeThemeContext);
  const linesRef = useRef(null);
  
  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const x1 = (Math.random() - 0.5) * 20;
      const y1 = (Math.random() - 0.5) * 10;
      const z1 = -5 - Math.random() * 5;
      const x2 = x1 + (Math.random() - 0.5) * 5;
      const y2 = y1 + (Math.random() - 0.5) * 5;
      const z2 = z1 + (Math.random() - 0.5) * 2;
      points.push(new THREE.Vector3(x1, y1, z1));
      points.push(new THREE.Vector3(x2, y2, z2));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (linesRef.current && linesRef.current.material instanceof THREE.LineBasicMaterial) {
      linesRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color={accent} transparent opacity={0.15} />
    </lineSegments>
  );
}

function DashboardScene() {
  const { accent } = useContext(ThreeThemeContext);
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color={accent} />
      
      <AmbientParticles />
      <SubtleGrid />
      <ConnectionLines />
      
      <GlowingOrb position={[-8, 3, -8]} />
      <GlowingOrb position={[10, -2, -10]} />
      <GlowingOrb position={[0, 5, -12]} />
    </>
  );
}

export function DashboardBackground() {
  const [themeColors, setThemeColors] = useState({ accent: '#513180', grid: '#1a0a2e' });

  useEffect(() => {
    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--color-accent').trim() || '#513180';
      // Derive a darker grid color by mixing accent with black
      const isDark = document.documentElement.getAttribute('data-theme') !== 'clean-light';
      const grid = isDark ? '#1a0a2e' : '#e0e0e0';
      setThemeColors({ accent, grid });
    };
    readColors();
    const observer = new MutationObserver(readColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <ThreeThemeContext.Provider value={themeColors}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <DashboardScene />
      </Canvas>
      </ThreeThemeContext.Provider>
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 opacity-80" style={{ background: 'linear-gradient(to bottom, transparent, transparent, var(--color-bg-primary))' }} />
      <div className="absolute inset-0 opacity-50" style={{ background: 'linear-gradient(to right, var(--color-bg-primary), transparent, var(--color-bg-primary))' }} />
    </div>
  );
}
