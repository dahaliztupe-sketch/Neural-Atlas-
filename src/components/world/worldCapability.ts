import { RouteName } from '../../router/router';
import { Theme } from '../../types';

export const DESKTOP_3D_MIN_WIDTH = 768;

export interface Hero3DCapabilityInput {
  routeName: RouteName;
  viewportWidth: number;
  prefersReducedMotion: boolean;
  webglSupported: boolean;
}

export function isPublicShell3DRoute(routeName: RouteName): boolean {
  return routeName === 'home';
}

export function shouldEnableHero3D({
  routeName,
  viewportWidth,
  prefersReducedMotion,
  webglSupported,
}: Hero3DCapabilityInput): boolean {
  if (routeName !== 'home') return false;
  if (viewportWidth < DESKTOP_3D_MIN_WIDTH) return false;
  if (prefersReducedMotion) return false;
  if (!webglSupported) return false;
  return true;
}

export function shouldEnableShell3D(input: Hero3DCapabilityInput): boolean {
  return shouldEnableHero3D(input);
}

export function shouldPreloadShell3D(input: {
  routeName: RouteName;
  viewportWidth: number;
  prefersReducedMotion: boolean;
  hasWebGLContext?: boolean;
}): boolean {
  if (!isPublicShell3DRoute(input.routeName)) return false;
  if (input.viewportWidth < DESKTOP_3D_MIN_WIDTH) return false;
  if (input.prefersReducedMotion) return false;
  if (input.hasWebGLContext === false) return false;
  return true;
}

export function resolveFrameloopMode(options: {
  isDocumentHidden: boolean;
  isSoftwareGl: boolean;
}): 'always' | 'demand' | 'never' {
  if (options.isDocumentHidden) return 'never';
  if (options.isSoftwareGl) return 'demand';
  return 'always';
}

export function hasDampingDelta(current: number, target: number, epsilon = 1e-3): boolean {
  return Math.abs(current - target) > epsilon;
}

export function computeHeroCanvasOpacity(options: {
  scrollY: number;
  viewportHeight: number;
  theme: Theme;
}): number {
  const baseOpacity = options.theme === 'light' ? 0.52 : 0.92;
  const minOpacity = options.theme === 'light' ? 0.04 : 0.08;
  const safeViewportHeight = Math.max(options.viewportHeight || 0, 1);
  const clampedScroll = Math.max(options.scrollY || 0, 0);
  // Smoothly attenuate as the visitor scrolls past the hero split band
  const progress = Math.min(clampedScroll / (safeViewportHeight * 0.8), 1);
  const eased = progress * (2 - progress);
  return Number((baseOpacity - (baseOpacity - minOpacity) * eased).toFixed(3));
}

export function computeShellCanvasOpacity(options: {
  routeName: RouteName;
  scrollY: number;
  viewportHeight: number;
  theme: Theme;
}): number {
  if (options.routeName === 'home') {
    return computeHeroCanvasOpacity(options);
  }
  return 0;
}
