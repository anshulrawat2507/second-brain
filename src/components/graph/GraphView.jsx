'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

// Single node sphere
function Node({ 
  node, 
  position, 
  isSelected,
  isHovered,
  onHover,
  onClick 
}) {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
      const scale = isHovered || isSelected ? 1.5 : 1.2;
      glowRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  const color = node.is_favorite ? '#fbbf24' : '#513180';
  const size = isHovered || isSelected ? 0.15 : 0.1;

  return (
    <group position={position}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      
      {/* Main node */}
      <mesh 
        ref={meshRef}
        onPointerOver={() => onHover(node.id)}
        onPointerOut={() => onHover(null)}
        onClick={() => onClick(node.id)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isHovered || isSelected ? 0.8 : 0.3}
        />
      </mesh>
      
      {/* Label */}
      {(isHovered || isSelected) && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.title.length > 20 ? node.title.slice(0, 20) + '...' : node.title}
        </Text>
      )}
    </group>
  );
}

// Connection line between nodes
function ConnectionLine({ 
  start, 
  end, 
  isTagLink = false 
}) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  return (
    <Line
      points={points}
      color={isTagLink ? '#2a1a40' : '#513180'}
      lineWidth={isTagLink ? 0.5 : 1}
      transparent
      opacity={isTagLink ? 0.2 : 0.5}
    />
  );
}

// Main graph scene
function GraphScene({ 
  data, 
  showTagLinks,
  selectedNode,
  onNodeClick 
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Calculate node positions using force-directed layout
  const nodePositions = useMemo(() => {
    const positions = new Map();
    const nodeCount = data.nodes.length;
    
    // Initial circular layout
    data.nodes.forEach((node, i) => {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 2;
      const z = Math.sin(angle) * radius;
      positions.set(node.id, [x, y, z]);
    });
    
    return positions;
  }, [data.nodes]);

  // Get position for a node
  const getPosition = useCallback((nodeId) => {
    return nodePositions.get(nodeId) || [0, 0, 0];
  }, [nodePositions]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#513180" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* Connection lines */}
      {data.links.map((link, i) => (
        <ConnectionLine
          key={`link-${i}`}
          start={getPosition(link.source)}
          end={getPosition(link.target)}
        />
      ))}
      
      {/* Tag link lines (optional) */}
      {showTagLinks && data.tagLinks.map((link, i) => (
        <ConnectionLine
          key={`taglink-${i}`}
          start={getPosition(link.source)}
          end={getPosition(link.target)}
          isTagLink
        />
      ))}
      
      {/* Nodes */}
      {data.nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          position={getPosition(node.id)}
          isSelected={selectedNode === node.id}
          isHovered={hoveredNode === node.id}
          onHover={setHoveredNode}
          onClick={onNodeClick}
        />
      ))}
      
      {/* Grid floor */}
      <gridHelper args={[20, 20, '#1a0a2e', '#1a0a2e']} position={[0, -3, 0]} />
      
      {/* Orbit controls */}
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={2}
        maxDistance={15}
      />
    </>
  );
}

export function GraphView({ onNodeClick, showTagLinks = false }) {
  const [data, setData] = useState({ nodes: [], links: [], tagLinks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [canvasBgColor, setCanvasBgColor] = useState('#0d0d0f');

  useEffect(() => {
    // Get the computed background color from CSS variables
    const updateBgColor = () => {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim();
      if (bgColor) {
        setCanvasBgColor(bgColor);
      }
    };
    updateBgColor();
    
    // Listen for theme changes
    const observer = new MutationObserver(updateBgColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const response = await fetch('/api/graph');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId);
    onNodeClick?.(nodeId);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🕸️</div>
          <p className="text-zinc-400">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950">
        <div className="text-center p-8 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-700/50">
          <div className="text-6xl mb-4">🕸️</div>
          <h3 className="text-xl font-bold text-zinc-100 mb-2">No notes yet</h3>
          <p className="text-zinc-400">
            Create some notes to see your knowledge graph
          </p>
          <p className="text-sm text-zinc-500 mt-4 opacity-75">
            Use [[note title]] to link notes together
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-zinc-950">
      <Canvas
        key={canvasBgColor}
        camera={{ position: [0, 2, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(canvasBgColor);
        }}
      >
        <GraphScene 
          data={data} 
          showTagLinks={showTagLinks}
          selectedNode={selectedNode}
          onNodeClick={handleNodeClick}
        />
      </Canvas>
      
      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 text-sm">
        <div className="flex items-center gap-4 text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {data.nodes.length} notes
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-px bg-purple-500"></span>
            {data.links.length} links
          </span>
        </div>
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span>🖱️ Drag to rotate</span>
          <span>🔍 Scroll to zoom</span>
          <span>👆 Click node to select</span>
        </div>
      </div>
    </div>
  );
}
