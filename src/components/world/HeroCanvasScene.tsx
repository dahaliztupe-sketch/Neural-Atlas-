import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Theme } from '../../types';
import { WorldCameraRig } from './WorldCameraRig';
import { WorldEnvironmentLighting, disposeCachedEnvironment } from './WorldEnvironmentLighting';
import { MonumentalPortal } from './MonumentalPortal';
import { CosmicAtmosphere } from './CosmicAtmosphere';
import { resolveFrameloopMode } from './worldCapability';
import { AstrolabeNodeId, HERO_BASE_ANCHOR } from './worldAnchors';

interface HeroCanvasSceneProps {
  theme: Theme;
  isSoftwareGl: boolean;
  prefersReducedMotion: boolean;
  isRtl: boolean;
  isHeroRoute?: boolean;
  hoveredNodeId?: AstrolabeNodeId | null;
  selectedNodeId?: AstrolabeNodeId | null;
  onHoverNode?: (id: AstrolabeNodeId | null) => void;
  onSelectNode?: (id: AstrolabeNodeId) => void;
}

const SceneInvalidator: React.FC<{
  theme: Theme;
  isRtl: boolean;
  isHeroRoute: boolean;
  hoveredNodeId?: AstrolabeNodeId | null;
  selectedNodeId?: AstrolabeNodeId | null;
}> = ({ theme, isRtl, isHeroRoute, hoveredNodeId, selectedNodeId }) => {
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [theme, isRtl, isHeroRoute, hoveredNodeId, selectedNodeId, invalidate]);
  return null;
};

export const HeroCanvasScene: React.FC<HeroCanvasSceneProps> = ({
  theme,
  isSoftwareGl,
  prefersReducedMotion,
  isRtl,
  isHeroRoute = true,
  hoveredNodeId = null,
  selectedNodeId = null,
  onHoverNode,
  onSelectNode,
}) => {
  const [isDocumentHidden, setIsDocumentHidden] = useState<boolean>(
    typeof document !== 'undefined' ? document.hidden : false
  );
  const [contextLost, setContextLost] = useState<boolean>(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const contextListenersCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      contextListenersCleanupRef.current?.();
      contextListenersCleanupRef.current = null;
      if (rendererRef.current) {
        try {
          disposeCachedEnvironment(rendererRef.current);
          rendererRef.current.dispose();
        } catch {
          // ignore disposal error on lost WebGL context
        }
        rendererRef.current = null;
      }
    };
  }, []);

  const frameloop = resolveFrameloopMode({
    isDocumentHidden: isDocumentHidden || contextLost,
    isSoftwareGl,
  });
  const isInteractive = Boolean(!contextLost && (onHoverNode || onSelectNode));

  return (
    <Canvas
      frameloop={frameloop}
      shadows={!isSoftwareGl}
      camera={{
        position: HERO_BASE_ANCHOR.position,
        fov: HERO_BASE_ANCHOR.fov,
        near: 0.1,
        far: 80,
      }}
      gl={{
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      dpr={isSoftwareGl ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)}
      onCreated={({ gl, invalidate }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = gl;

        contextListenersCleanupRef.current?.();
        const canvasEl = gl.domElement;
        const onContextLost = (event: Event) => {
          event.preventDefault();
          setContextLost(true);
        };
        const onContextRestored = () => {
          setContextLost(false);
          invalidate();
        };
        canvasEl.addEventListener('webglcontextlost', onContextLost, false);
        canvasEl.addEventListener('webglcontextrestored', onContextRestored, false);
        contextListenersCleanupRef.current = () => {
          canvasEl.removeEventListener('webglcontextlost', onContextLost, false);
          canvasEl.removeEventListener('webglcontextrestored', onContextRestored, false);
        };
      }}
      className={`w-full h-full ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'} ${
        contextLost ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <SceneInvalidator
        theme={theme}
        isRtl={isRtl}
        isHeroRoute={isHeroRoute}
        hoveredNodeId={hoveredNodeId}
        selectedNodeId={selectedNodeId}
      />
      <WorldCameraRig
        prefersReducedMotion={prefersReducedMotion}
        isHeroRoute={isHeroRoute}
        isSoftwareGl={isSoftwareGl}
      />
      <WorldEnvironmentLighting theme={theme} isSoftwareGl={isSoftwareGl} />
      <MonumentalPortal
        theme={theme}
        prefersReducedMotion={prefersReducedMotion}
        isRtl={isRtl}
        isSoftwareGl={isSoftwareGl}
        hoveredNodeId={hoveredNodeId}
        selectedNodeId={selectedNodeId}
        onHoverNode={onHoverNode}
        onSelectNode={onSelectNode}
      />
      <CosmicAtmosphere
        theme={theme}
        prefersReducedMotion={prefersReducedMotion}
        isSoftwareGl={isSoftwareGl}
      />
    </Canvas>
  );
};

export default HeroCanvasScene;
