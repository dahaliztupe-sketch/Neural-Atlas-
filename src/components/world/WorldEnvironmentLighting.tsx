import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Theme } from '../../types';

interface WorldEnvironmentLightingProps {
  theme: Theme;
  isSoftwareGl: boolean;
}

const cachedEnvTargets = new WeakMap<THREE.WebGLRenderer, THREE.WebGLRenderTarget>();
const compiledRenderers = new WeakSet<THREE.WebGLRenderer>();
let rectAreaUniformsInitialized = false;

export function disposeCachedEnvironment(gl: THREE.WebGLRenderer): void {
  const cachedTarget = cachedEnvTargets.get(gl);
  if (cachedTarget) {
    cachedTarget.dispose();
    cachedEnvTargets.delete(gl);
  }
  compiledRenderers.delete(gl);
}

export const WorldEnvironmentLighting: React.FC<WorldEnvironmentLightingProps> = ({
  theme,
  isSoftwareGl,
}) => {
  const { gl, scene, camera, invalidate } = useThree();
  const isDark = theme === 'dark';

  // Generate procedural studio IBL via RoomEnvironment once per WebGLRenderer (preserving full visual PBR parity across theme toggles without rebuilding PMREM or recompiling shaders)
  useEffect(() => {
    let renderTarget = cachedEnvTargets.get(gl);
    if (!renderTarget) {
      const pmremGenerator = new THREE.PMREMGenerator(gl);
      const roomEnv = new RoomEnvironment();
      renderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      cachedEnvTargets.set(gl, renderTarget);
      roomEnv.dispose();
      pmremGenerator.dispose();
    }

    scene.environment = renderTarget.texture;

    if (!isSoftwareGl) {
      if (!rectAreaUniformsInitialized) {
        RectAreaLightUniformsLib.init();
        rectAreaUniformsInitialized = true;
      }
      if (!compiledRenderers.has(gl)) {
        gl.compile(scene, camera);
        compiledRenderers.add(gl);
      }
    }

    invalidate();

    return () => {
      scene.environment = null;
    };
  }, [gl, scene, camera, isSoftwareGl, invalidate]);

  useEffect(() => {
    scene.environmentIntensity = isDark ? 0.95 : 0.78;
    invalidate();
  }, [scene, isDark, invalidate]);

  return (
    <>
      <fog
        attach="fog"
        args={[isDark ? '#050811' : '#f4f6fb', isDark ? 9 : 10, isDark ? 32 : 34]}
      />

      {/* Warm/Cool Studio Hemisphere Fill */}
      <hemisphereLight
        args={[
          isDark ? '#7dd3fc' : '#e0f2fe',
          isDark ? '#0b1120' : '#cbd5e1',
          isDark ? 0.65 : 0.85,
        ]}
      />

      {/* Primary Studio Key Light (tight shadow frustum on GPU) */}
      <directionalLight
        position={[5.5, 6.5, 6.5]}
        color={isDark ? '#fef3c7' : '#ffffff'}
        intensity={isDark ? 1.85 : 1.55}
        castShadow={!isSoftwareGl}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Cool Optical Cyan Rim Light separating dark obsidian bevels */}
      <directionalLight
        position={[-6, 3.5, -4]}
        color={isDark ? '#22d3ee' : '#0891b2'}
        intensity={isDark ? 1.35 : 0.9}
      />

      {/* Subtle Amethyst Rim / Under-Fill */}
      <pointLight
        position={[2.2, -1.8, 2.6]}
        color={isDark ? '#8b5cf6' : '#6d28d9'}
        intensity={isDark ? 1.4 : 0.75}
        distance={10}
        decay={2}
      />

      {/* Studio Softbox Highlight Strip (skipped on software WebGL for speed) */}
      {!isSoftwareGl && (
        <rectAreaLight
          position={[3.6, 4.2, 4.5]}
          width={3.8}
          height={1.4}
          intensity={isDark ? 2.4 : 1.6}
          color={isDark ? '#e0e7ff' : '#ffffff'}
          onUpdate={(self) => self.lookAt(2.05, 0, 0)}
        />
      )}
    </>
  );
};
