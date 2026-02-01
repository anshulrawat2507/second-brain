'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function KnowledgeGraph({ className }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animationRef = useRef(null);

  // Fetch graph data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/graph');
        const result = await response.json();
        if (result.success) {
          const centerX = 500;
          const centerY = 350;
          const radius = 250;
          
          // Position nodes in a nice circular layout with some randomness
          const nodes = result.data.nodes.map((node, i) => {
            const angle = (i / result.data.nodes.length) * Math.PI * 2;
            const r = radius * (0.5 + Math.random() * 0.5);
            return {
              ...node,
              x: centerX + Math.cos(angle) * r + (Math.random() - 0.5) * 80,
              y: centerY + Math.sin(angle) * r + (Math.random() - 0.5) * 80,
              vx: 0,
              vy: 0,
            };
          });
          setData({ nodes, links: result.data.links });
        }
      } catch (error) {
        console.error('Error fetching graph:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Force simulation with smoother physics
  useEffect(() => {
    if (!data) return;

    const simulate = () => {
      const nodes = [...data.nodes];
      const links = data.links;

      nodes.forEach((node, i) => {
        // Repulsion from other nodes
        nodes.forEach((other, j) => {
          if (i === j) return;
          const dx = (node.x || 0) - (other.x || 0);
          const dy = (node.y || 0) - (other.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 800 / (dist * dist);
          node.vx = (node.vx || 0) + (dx / dist) * force;
          node.vy = (node.vy || 0) + (dy / dist) * force;
        });

        // Center gravity
        const cx = 500, cy = 350;
        node.vx = (node.vx || 0) + (cx - (node.x || 0)) * 0.005;
        node.vy = (node.vy || 0) + (cy - (node.y || 0)) * 0.005;
      });

      // Link attraction
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const dx = (target.x || 0) - (source.x || 0);
        const dy = (target.y || 0) - (source.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.03;

        source.vx = (source.vx || 0) + (dx / dist) * force;
        source.vy = (source.vy || 0) + (dy / dist) * force;
        target.vx = (target.vx || 0) - (dx / dist) * force;
        target.vy = (target.vy || 0) - (dy / dist) * force;
      });

      // Apply velocity with damping
      nodes.forEach(node => {
        node.x = (node.x || 0) + (node.vx || 0) * 0.1;
        node.y = (node.y || 0) + (node.vy || 0) * 0.1;
        node.vx = (node.vx || 0) * 0.85;
        node.vy = (node.vy || 0) * 0.85;
      });

      setData({ nodes, links });
    };

    animationRef.current = setInterval(simulate, 20);
    return () => clearInterval(animationRef.current);
  }, [data?.nodes.length]);

  // Render canvas - Clean minimalist style
  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Get theme colors
    const styles = getComputedStyle(document.documentElement);
    const bgColor = styles.getPropertyValue('--color-bg-primary').trim() || '#0d0d0f';
    const nodeColor = styles.getPropertyValue('--graph-node').trim() || '#6b6b73';
    const nodeHoverColor = styles.getPropertyValue('--graph-node-hover').trim() || '#8b5cf6';
    const edgeColor = styles.getPropertyValue('--graph-edge').trim() || '#3a3a42';
    const labelColor = styles.getPropertyValue('--graph-label').trim() || '#a0a0a8';

    // Clear with background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.translate(offset.x + rect.width / 2 - 500, offset.y + rect.height / 2 - 350);
    ctx.scale(zoom, zoom);

    // Draw links first (behind nodes)
    data.links.forEach(link => {
      const source = data.nodes.find(n => n.id === link.source);
      const target = data.nodes.find(n => n.id === link.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x || 0, source.y || 0);
      ctx.lineTo(target.x || 0, target.y || 0);
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw nodes - Simple circles with labels below
    data.nodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const nodeRadius = 6;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? nodeHoverColor : nodeColor;
      ctx.fill();

      // Draw label below node
      ctx.fillStyle = isHovered ? nodeHoverColor : labelColor;
      ctx.font = '12px Inter, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = node.title.length > 18 ? node.title.slice(0, 18) + '...' : node.title;
      ctx.fillText(label, node.x || 0, (node.y || 0) + nodeRadius + 6);
    });

    ctx.restore();
  }, [data, hoveredNode, zoom, offset]);

  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    if (!data || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Transform to graph coordinates
    const x = (canvasX - (rect.width / 2 - 500 + offset.x)) / zoom;
    const y = (canvasY - (rect.height / 2 - 350 + offset.y)) / zoom;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Find hovered node
    const node = data.nodes.find(n => {
      const dx = (n.x || 0) - x;
      const dy = (n.y || 0) - y;
      return dx * dx + dy * dy < 400; // 20px radius squared
    });
    setHoveredNode(node || null);
    canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
  }, [data, isDragging, dragStart, zoom, offset]);

  const handleMouseDown = useCallback((e) => {
    if (hoveredNode) {
      // Navigate to note
      router.push(`/dashboard?note=${hoveredNode.id}`);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    }
  }, [hoveredNode, offset, router]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(3, z * delta)));
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.style.width = rect.width + 'px';
        canvasRef.current.style.height = rect.height + 'px';
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Loading graph...</p>
        </div>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
              <circle cx="12" cy="12" r="2" />
              <circle cx="6" cy="6" r="2" />
              <circle cx="18" cy="6" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
              <path d="M10.5 10.5 7.5 7.5M13.5 10.5l3-3M10.5 13.5l-3 3M13.5 13.5l3 3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-100 mb-1">No connections yet</h3>
          <p className="text-sm text-zinc-500">Create notes with backlinks to see your knowledge graph</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setZoom(z => Math.min(3, z * 1.2))}
          className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}
          className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35M8 11h6" />
          </svg>
        </button>
        <button
          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
          className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3.5 5.5 2 7l5 5-5 5 1.5 1.5L10 12zM14 18h8M14 12h8M14 6h8" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 p-3 bg-zinc-900/90 backdrop-blur border border-zinc-700/50 rounded-lg">
        <p className="text-xs font-medium text-zinc-400 mb-2">Knowledge Graph</p>
        <p className="text-[10px] text-zinc-500">{data.nodes.length} notes • {data.links.length} connections</p>
      </div>

      {/* Hovered node info */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 p-3 bg-zinc-900/90 backdrop-blur border border-zinc-700/50 rounded-lg max-w-xs">
          <p className="text-sm font-medium text-zinc-100 truncate">{hoveredNode.title}</p>
          <p className="text-xs text-zinc-500">{hoveredNode.connections} connections</p>
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;
