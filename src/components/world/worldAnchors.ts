import { HeroAnchor } from './types';

export type AstrolabeNodeId =
  | 'cs-problem-solving'
  | 'experimental-systems'
  | 'intelligent-computing';

export interface AstrolabeNodeConfig {
  id: AstrolabeNodeId;
  position: [number, number, number];
  radius: number;
  tone: 'cyan' | 'violet' | 'sky';
  targetRoute: string;
  caliperAngleRad: number;
  crystalYawOffsetRad: number;
}

export const HERO_BASE_ANCHOR: HeroAnchor = {
  position: [0.0, 0.28, 9.3],
  target: [0.0, 0.0, 0.0],
  fov: 40,
};

export const ASTROLABE_NODES: AstrolabeNodeConfig[] = [
  {
    id: 'cs-problem-solving',
    position: [-1.72, 1.18, 0.36],
    radius: 0.125,
    tone: 'cyan',
    targetRoute: '/projects/cpp-problem-solving',
    caliperAngleRad: 2.54,
    crystalYawOffsetRad: -0.45,
  },
  {
    id: 'experimental-systems',
    position: [1.82, 0.42, -0.44],
    radius: 0.145,
    tone: 'violet',
    targetRoute: '/projects',
    caliperAngleRad: 0.23,
    crystalYawOffsetRad: 0.55,
  },
  {
    id: 'intelligent-computing',
    position: [-0.48, -1.62, -0.34],
    radius: 0.115,
    tone: 'sky',
    targetRoute: '/academic',
    caliperAngleRad: -1.86,
    crystalYawOffsetRad: 0.12,
  },
];

export function getAstrolabeStageOffsetX(isRtl: boolean): number {
  return isRtl ? -2.05 : 2.05;
}

export function resolveAstrolabeNode(
  nodeId: AstrolabeNodeId | null | undefined
): AstrolabeNodeConfig | null {
  if (!nodeId) return null;
  return ASTROLABE_NODES.find((node) => node.id === nodeId) ?? null;
}

export function computeWaveguideFocusIntensity(params: {
  nodeId: AstrolabeNodeId;
  hoveredNodeId: AstrolabeNodeId | null;
  selectedNodeId: AstrolabeNodeId | null;
  isDark: boolean;
}): number {
  const { nodeId, hoveredNodeId, selectedNodeId, isDark } = params;
  const activeId = hoveredNodeId ?? selectedNodeId;
  if (!activeId) {
    return isDark ? 0.28 : 0.12;
  }
  if (activeId === nodeId) {
    return isDark ? 0.92 : 0.48;
  }
  return isDark ? 0.16 : 0.08;
}

export function computeAnchorNodeScale(params: {
  nodeId: AstrolabeNodeId;
  hoveredNodeId: AstrolabeNodeId | null;
  selectedNodeId: AstrolabeNodeId | null;
}): number {
  const { nodeId, hoveredNodeId, selectedNodeId } = params;
  if (hoveredNodeId === nodeId) return 1.32;
  if (selectedNodeId === nodeId) return 1.18;
  return 1.0;
}

export function getAstrolabeCaliperAngle(
  nodeId: AstrolabeNodeId | null | undefined
): number | null {
  const node = resolveAstrolabeNode(nodeId);
  return node ? node.caliperAngleRad : null;
}

export function resolveSafeAstrolabeTarget(params: {
  nodeId: AstrolabeNodeId;
  publishedProjectSlugs: string[];
}): { route: string; hasDirectProject: boolean } {
  const { nodeId, publishedProjectSlugs } = params;
  if (nodeId === 'intelligent-computing') {
    return { route: '/academic', hasDirectProject: false };
  }
  if (nodeId === 'experimental-systems') {
    return { route: '/projects', hasDirectProject: false };
  }
  const expectedSlug = 'cpp-problem-solving';
  const existsInPublished = publishedProjectSlugs.some(
    (s) => s.toLowerCase() === expectedSlug
  );
  if (existsInPublished) {
    return { route: `/projects/${expectedSlug}`, hasDirectProject: true };
  }
  return { route: '/projects', hasDirectProject: false };
}
