'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import RetroScene with no SSR to avoid hydration mismatch
const RetroScene = dynamic(
  () => import('@/components/three/RetroScene').then(mod => mod.RetroScene),
  { ssr: false }
);

export function LandingHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] relative overflow-hidden">
      {/* 3D Background - only render on client */}
      {mounted && <RetroScene />}
      
      {/* Header */}
      <header className="border-b border-[var(--border)] border-opacity-50 py-4 px-6 relative z-10 backdrop-blur-sm bg-[var(--bg-primary)] bg-opacity-80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent)] text-2xl">◉</span>
            <span className="text-[var(--text-primary)] font-bold text-xl">
              Second Brain
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-[#8b5cf6] rounded hover:bg-[#a78bfa] transition-colors font-medium"
              style={{ color: '#ffffff' }}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Minimal ASCII Logo */}
          <pre className="text-[var(--accent)] text-xs sm:text-sm mb-6 font-mono inline-block opacity-90">
{`
 ┌─────────────────────────┐
 │   ◈ SECOND BRAIN ◈     │
 └─────────────────────────┘
`}
          </pre>

          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Think. Write. Remember.
          </h1>
          
          <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-md mx-auto opacity-80">
            Your notes. Your data. Forever free.
          </p>

          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-[#8b5cf6] rounded font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#8b5cf6]/20 hover:bg-[#a78bfa]"
            style={{ color: '#ffffff' }}
          >
            Start Writing →
          </Link>

          {/* Minimal Feature Icons */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-[var(--text-secondary)]">
            <FeatureIcon icon="[md]" label="Markdown" />
            <FeatureIcon icon="[◇]" label="Beautiful UI" />
            <FeatureIcon icon="[⚡]" label="Auto-save" />
            <FeatureIcon icon="[∞]" label="Free Forever" />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 px-6 relative z-10">
        <p className="text-center text-xs text-[var(--text-secondary)] opacity-50">
          Open source • Self-hostable • No tracking
        </p>
      </footer>
    </div>
  );
}

function FeatureIcon({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <span className="font-mono text-[var(--accent)] text-lg group-hover:text-[var(--highlight)] transition-colors">
        {icon}
      </span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}
