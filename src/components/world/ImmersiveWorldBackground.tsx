import React, { Component, ReactNode, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { matchRoute } from '../../router/router';
import { AstrolabeNodeId } from './worldAnchors';
import {
  computeShellCanvasOpacity,
  shouldEnableHero3D,
  shouldPreloadShell3D,
} from './worldCapability';
import { useWorldScene } from './WorldSceneContext';

let heroCanvasScenePromise: Promise<typeof import('./HeroCanvasScene')> | null = null;

export function loadHeroCanvasScene(): Promise<typeof import('./HeroCanvasScene')> {
  if (!heroCanvasScenePromise) {
    heroCanvasScenePromise = import('./HeroCanvasScene');
  }
  return heroCanvasScenePromise;
}

export function preloadDesktop3DIfEligible(): void {
  if (typeof window === 'undefined') return;
  const routeName = matchRoute(window.location.pathname || '/').routeName;
  const prefersReducedMotion =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  const eligibleRouteAndViewport = shouldPreloadShell3D({
    routeName,
    viewportWidth: window.innerWidth || 0,
    prefersReducedMotion,
    hasWebGLContext: Boolean(window.WebGLRenderingContext),
  });
  if (eligibleRouteAndViewport && probeWebGL().supported) {
    void loadHeroCanvasScene();
  }
}

const LazyHeroCanvasScene = lazy(loadHeroCanvasScene);

interface WebGLProbeResult {
  supported: boolean;
  isSoftwareGl: boolean;
}

let cachedWebGLProbe: WebGLProbeResult | null = null;

const probeWebGL = (): WebGLProbeResult => {
  if (cachedWebGLProbe) {
    return cachedWebGLProbe;
  }
  if (typeof window === 'undefined') {
    return { supported: false, isSoftwareGl: false };
  }
  try {
    if (!window.WebGLRenderingContext) {
      cachedWebGLProbe = { supported: false, isSoftwareGl: false };
      return cachedWebGLProbe;
    }
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ||
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) {
      cachedWebGLProbe = { supported: false, isSoftwareGl: false };
      return cachedWebGLProbe;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cachedWebGLProbe = {
      supported: true,
      isSoftwareGl: /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu),
    };
    return cachedWebGLProbe;
  } catch {
    cachedWebGLProbe = { supported: false, isSoftwareGl: false };
    return cachedWebGLProbe;
  }
};

interface WorldErrorBoundaryProps {
  children: ReactNode;
}

interface WorldErrorBoundaryState {
  hasError: boolean;
}

class WorldErrorBoundary extends Component<WorldErrorBoundaryProps, WorldErrorBoundaryState> {
  constructor(props: WorldErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WorldErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('Hero 3D Canvas caught by error boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

interface HeroAmbientCanvasHostProps {
  hoveredNodeId?: AstrolabeNodeId | null;
  selectedNodeId?: AstrolabeNodeId | null;
  onHoverNode?: (id: AstrolabeNodeId | null) => void;
  onSelectNode?: (id: AstrolabeNodeId) => void;
}

export const HeroAmbientCanvasHost: React.FC<HeroAmbientCanvasHostProps> = (props) => {
  const { theme, currentRoute, isRtl } = useApp();
  const worldScene = useWorldScene();
  const webglProbe = useMemo(() => probeWebGL(), []);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHeroRoute = currentRoute.routeName === 'home';
  const hoveredNodeId = props.hoveredNodeId !== undefined ? props.hoveredNodeId : worldScene.hoveredNodeId;
  const selectedNodeId = props.selectedNodeId !== undefined ? props.selectedNodeId : worldScene.selectedNodeId;
  const onHoverNode = isHeroRoute ? props.onHoverNode ?? worldScene.setHoveredNodeId : undefined;
  const onSelectNode = isHeroRoute ? props.onSelectNode ?? worldScene.setSelectedNodeId : undefined;

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const enabled = shouldEnableHero3D({
    routeName: currentRoute.routeName,
    viewportWidth,
    prefersReducedMotion,
    webglSupported: webglProbe.supported,
  });

  // Smooth scroll/route-linked opacity attenuation directly on container ref (zero React re-renders on scroll)
  useEffect(() => {
    if (!enabled) return;
    let rafId: number | null = null;

    const applyOpacity = () => {
      rafId = null;
      if (!containerRef.current) return;
      const opacity = computeShellCanvasOpacity({
        routeName: currentRoute.routeName,
        scrollY: window.scrollY || 0,
        viewportHeight: window.innerHeight || 900,
        theme,
      });
      containerRef.current.style.opacity = String(opacity);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(applyOpacity);
    };

    applyOpacity();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled, theme, currentRoute.routeName]);

  if (!enabled) {
    return null;
  }

  const isInteractive = Boolean(isHeroRoute && (onHoverNode || onSelectNode));
  const initialOpacity = computeShellCanvasOpacity({
    routeName: currentRoute.routeName,
    scrollY: 0,
    viewportHeight: 900,
    theme,
  });

  return (
    <div
      ref={containerRef}
      data-testid="hero-3d-canvas-host"
      data-mode={isHeroRoute ? 'interactive-hero' : 'ambient-shell'}
      data-route={currentRoute.routeName}
      data-active-node={hoveredNodeId ?? selectedNodeId ?? ''}
      style={{ opacity: initialOpacity }}
      className={`${
        isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      } fixed inset-0 w-full h-full z-[1] overflow-hidden transition-opacity duration-300`}
      aria-hidden="true"
    >
      <WorldErrorBoundary>
        <Suspense fallback={null}>
          <LazyHeroCanvasScene
            theme={theme}
            isSoftwareGl={webglProbe.isSoftwareGl}
            prefersReducedMotion={prefersReducedMotion}
            isRtl={isRtl}
            isHeroRoute={isHeroRoute}
            hoveredNodeId={hoveredNodeId}
            selectedNodeId={selectedNodeId}
            onHoverNode={onHoverNode}
            onSelectNode={onSelectNode}
          />
        </Suspense>
      </WorldErrorBoundary>
    </div>
  );
};

export const ImmersiveWorldBackground = HeroAmbientCanvasHost;
