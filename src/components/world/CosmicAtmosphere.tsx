import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Theme } from '../../types';

interface CosmicAtmosphereProps {
  theme: Theme;
  prefersReducedMotion: boolean;
  isSoftwareGl?: boolean;
}

const PARTICLE_COUNT = 120;

// Deterministic PRNG (Mulberry32) so particle distribution is calm and repeatable across renders
function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CosmicAtmosphere: React.FC<CosmicAtmosphereProps> = ({
  theme,
  prefersReducedMotion,
  isSoftwareGl = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const colorAttrRef = useRef<THREE.BufferAttribute>(null);

  const { positions, colorIndices, colors } = useMemo(() => {
    const rand = createSeededRandom(202604);
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const colIdx = new Uint8Array(PARTICLE_COUNT);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      pos[idx] = (rand() - 0.5) * 26;
      pos[idx + 1] = (rand() - 0.5) * 16;
      pos[idx + 2] = (rand() - 0.65) * 20 - 3;

      const r = rand();
      colIdx[i] = r < 0.4 ? 0 : r < 0.8 ? 1 : 2;
    }

    return { positions: pos, colorIndices: colIdx, colors: col };
  }, []);

  useEffect(() => {
    const cyan = new THREE.Color(theme === 'dark' ? '#22d3ee' : '#0891b2');
    const violet = new THREE.Color(theme === 'dark' ? '#a78bfa' : '#6d28d9');
    const titanium = new THREE.Color(theme === 'dark' ? '#94a3b8' : '#475569');
    const palette = [cyan, violet, titanium];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      const chosen = palette[colorIndices[i]];
      colors[idx] = chosen.r;
      colors[idx + 1] = chosen.g;
      colors[idx + 2] = chosen.b;
    }

    if (colorAttrRef.current) {
      colorAttrRef.current.needsUpdate = true;
    }
  }, [theme, colorIndices, colors]);

  useFrame((state) => {
    if (prefersReducedMotion || isSoftwareGl || !pointsRef.current) return;
    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.y = time * 0.008;
    pointsRef.current.rotation.x = Math.sin(time * 0.035) * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute ref={colorAttrRef} attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={theme === 'dark' ? 0.048 : 0.038}
        vertexColors
        transparent
        opacity={theme === 'dark' ? 0.38 : 0.22}
        sizeAttenuation
      />
    </points>
  );
};
