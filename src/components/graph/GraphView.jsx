'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

// Single node sphere
function Node({ node, position, isSelected, isHovered, onHover, onClick, accentColor }) {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
      const scale = isHovered || isSelected ? 1.5 : 1.2;
      glowRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  const color = node.is_favorite ? '#fbbf24' : accentColor;
  const size = isHovered || isSelected ? 0.15 : 0.1;

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <mesh ref={meshRef} onPointerOver={() => onHover(node.id)} onPointerOut={() => onHover(null)} onClick={() => onClick(node.id)}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHovered || isSelected ? 0.8 : 0.3} />
      </mesh>
      {(isHovered || isSelected) && (
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          {node.title.length > 20 ? node.title.slice(0, 20) + '...' : node.title}
        </Text>
      )}
    </group>
  );
}

// Connection line
function ConnectionLine({ start, end, isTagLink = false, accentColor }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  return (
    <Line points={points} color={isTagLink ? accentColor : accentColor} lineWidth={isTagLink ? 0.5 : 1} transparent opacity={isTagLink ? 0.15 : 0.4} />
  );
}

// Graph scene
function GraphScene({ data, showTagLinks, selectedNode, onNodeClick, accentColor }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  
  const nodePositions = useMemo(() => {
    const positions = new Map();
    const nodeCount = data.nodes.length;
    data.nodes.forEach((node, i) => {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      positions.set(node.id, [Math.cos(angle) * radius, (Math.random() - 0.5) * 2, Math.sin(angle) * radius]);
    });
    return positions;
  }, [data.nodes]);

  const getPosition = useCallback((nodeId) => nodePositions.get(nodeId) || [0, 0, 0], [nodePositions]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color={accentColor} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={accentColor} />
      
      {data.links.map((link, i) => (
        <ConnectionLine key={`link-${i}`} start={getPosition(link.source)} end={getPosition(link.target)} accentColor={accentColor} />
      ))}
      
      {showTagLinks && data.tagLinks.map((link, i) => (
        <ConnectionLine key={`taglink-${i}`} start={getPosition(link.source)} end={getPosition(link.target)} isTagLink accentColor={accentColor} />
      ))}
      
      {data.nodes.map((node) => (
        <Node key={node.id} node={node} position={getPosition(node.id)} isSelected={selectedNode === node.id} isHovered={hoveredNode === node.id} onHover={setHoveredNode} onClick={onNodeClick} accentColor={accentColor} />
      ))}
      
      <gridHelper args={[20, 20, accentColor, accentColor]} position={[0, -3, 0]} />
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={15} />
    </>
  );
}

export function GraphView({ onNodeClick, showTagLinks = false }) {
  const [data, setData] = useState({ nodes: [], links: [], tagLinks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [canvasBgColor, setCanvasBgColor] = useState('#0d0d0f');
  const [accentColor, setAccentColor] = useState('#8b5cf6');

  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      const bg = style.getPropertyValue('--color-bg-primary').trim();
      const accent = style.getPropertyValue('--color-accent').trim();
      if (bg) setCanvasBgColor(bg);
      if (accent) setAccentColor(accent);
    };
    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { fetchGraphData(); }, []);

  const fetchGraphData = async () => {
    try {
      const response = await fetch('/api/graph');
      const result = await response.json();
      if (result.success) setData(result.data);
      else setError(result.error);
    } catch (err) {
      setError('Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (nodeId) => { setSelectedNode(nodeId); onNodeClick?.(nodeId); };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-4" style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
          <p style={{ color: 'var(--color-text-tertiary)' }}>Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center p-8 rounded-2xl backdrop-blur-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-6xl mb-4">🕸️</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>No notes yet</h3>
          <p style={{ color: 'var(--color-text-tertiary)' }}>Create some notes to see your knowledge graph</p>
          <p className="text-sm mt-4 opacity-75" style={{ color: 'var(--color-text-muted)' }}>Use [[note title]] to link notes together</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <Canvas key={canvasBgColor} camera={{ position: [0, 2, 8], fov: 60 }} gl={{ antialias: true, alpha: false }} onCreated={({ gl }) => { gl.setClearColor(canvasBgColor); }}>
        <GraphScene data={data} showTagLinks={showTagLinks} selectedNode={selectedNode} onNodeClick={handleNodeClick} accentColor={accentColor} />
      </Canvas>
      
      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl backdrop-blur-xl text-sm"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-4" style={{ color: 'var(--color-text-tertiary)' }}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></span>
            {data.nodes.length} notes
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-px" style={{ backgroundColor: 'var(--color-accent)' }}></span>
            {data.links.length} links
          </span>
        </div>
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl backdrop-blur-xl text-xs"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-secondary) 80%, transparent)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
        <div className="flex items-center gap-3">
          <span>Drag to rotate</span>
          <span>Scroll to zoom</span>
          <span>Click node to select</span>
        </div>
      </div>
    </div>
  );
}
