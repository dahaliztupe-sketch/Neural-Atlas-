import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASTROLABE_NODES,
  computeAnchorNodeScale,
  computeWaveguideFocusIntensity,
  getAstrolabeCaliperAngle,
  getAstrolabeStageOffsetX,
  HERO_BASE_ANCHOR,
  resolveAstrolabeNode,
  resolveSafeAstrolabeTarget,
} from './worldAnchors';
import {
  DESKTOP_3D_MIN_WIDTH,
  shouldEnableHero3D,
  shouldEnableShell3D,
  shouldPreloadShell3D,
  isPublicShell3DRoute,
  resolveFrameloopMode,
  computeHeroCanvasOpacity,
  computeShellCanvasOpacity,
  hasDampingDelta,
} from './worldCapability';

test('world anchors frame the studio hero camera and mirror X offset between LTR and RTL', () => {
  assert.equal(HERO_BASE_ANCHOR.fov, 40);
  assert.equal(getAstrolabeStageOffsetX(false), 2.05);
  assert.equal(getAstrolabeStageOffsetX(true), -2.05);
});

test('ASTROLABE_NODES map to verified public routes without internal_archive leaks', () => {
  assert.equal(ASTROLABE_NODES.length, 3);
  assert.equal(resolveAstrolabeNode('cs-problem-solving')?.targetRoute, '/projects/cpp-problem-solving');
  assert.equal(resolveAstrolabeNode('experimental-systems')?.targetRoute, '/projects');
  assert.equal(resolveAstrolabeNode('intelligent-computing')?.targetRoute, '/academic');
  assert.equal(resolveAstrolabeNode(null), null);

  assert.deepEqual(
    resolveSafeAstrolabeTarget({ nodeId: 'cs-problem-solving', publishedProjectSlugs: [] }),
    {
      route: '/projects',
      hasDirectProject: false,
    }
  );
  assert.deepEqual(
    resolveSafeAstrolabeTarget({
      nodeId: 'cs-problem-solving',
      publishedProjectSlugs: ['cpp-problem-solving'],
    }),
    { route: '/projects/cpp-problem-solving', hasDirectProject: true }
  );
  assert.deepEqual(
    resolveSafeAstrolabeTarget({ nodeId: 'experimental-systems', publishedProjectSlugs: [] }),
    {
      route: '/projects',
      hasDirectProject: false,
    }
  );
  assert.deepEqual(
    resolveSafeAstrolabeTarget({ nodeId: 'intelligent-computing', publishedProjectSlugs: [] }),
    {
      route: '/academic',
      hasDirectProject: false,
    }
  );
});

test('node focus intensity and scale prioritize hovered node over selected node', () => {
  assert.equal(
    computeWaveguideFocusIntensity({
      nodeId: 'cs-problem-solving',
      hoveredNodeId: 'experimental-systems',
      selectedNodeId: 'cs-problem-solving',
      isDark: true,
    }),
    0.16
  );
  assert.equal(
    computeWaveguideFocusIntensity({
      nodeId: 'experimental-systems',
      hoveredNodeId: 'experimental-systems',
      selectedNodeId: 'cs-problem-solving',
      isDark: true,
    }),
    0.92
  );
  assert.equal(
    computeAnchorNodeScale({
      nodeId: 'experimental-systems',
      hoveredNodeId: 'experimental-systems',
      selectedNodeId: 'cs-problem-solving',
    }),
    1.32
  );
  assert.equal(
    computeAnchorNodeScale({
      nodeId: 'cs-problem-solving',
      hoveredNodeId: null,
      selectedNodeId: 'cs-problem-solving',
    }),
    1.18
  );
  assert.equal(typeof getAstrolabeCaliperAngle('intelligent-computing'), 'number');
  assert.equal(getAstrolabeCaliperAngle(null), null);
});

test('shouldEnableHero3D activates strictly on desktop home route with WebGL and non-reduced motion', () => {
  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: DESKTOP_3D_MIN_WIDTH,
      prefersReducedMotion: false,
      webglSupported: true,
    }),
    true
  );

  assert.equal(
    shouldEnableHero3D({
      routeName: 'projects',
      viewportWidth: 1440,
      prefersReducedMotion: false,
      webglSupported: true,
    }),
    false
  );

  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: DESKTOP_3D_MIN_WIDTH - 1,
      prefersReducedMotion: false,
      webglSupported: true,
    }),
    false
  );

  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: 1440,
      prefersReducedMotion: true,
      webglSupported: true,
    }),
    false
  );

  assert.equal(
    shouldEnableHero3D({
      routeName: 'home',
      viewportWidth: 1440,
      prefersReducedMotion: false,
      webglSupported: false,
    }),
    false
  );
});

test('resolveFrameloopMode pauses hidden tabs and switches software WebGL to demand', () => {
  assert.equal(resolveFrameloopMode({ isDocumentHidden: true, isSoftwareGl: false }), 'never');
  assert.equal(resolveFrameloopMode({ isDocumentHidden: false, isSoftwareGl: true }), 'demand');
  assert.equal(resolveFrameloopMode({ isDocumentHidden: false, isSoftwareGl: false }), 'always');
});

test('hasDampingDelta settles demand-mode transitions cleanly within epsilon', () => {
  assert.equal(hasDampingDelta(0, 1.5), true);
  assert.equal(hasDampingDelta(1.4995, 1.5), false);
  assert.equal(hasDampingDelta(1.498, 1.5), true);
});

test('computeHeroCanvasOpacity preserves high obsidian presence at top and smoothly dims on scroll', () => {
  const darkTop = computeHeroCanvasOpacity({ scrollY: 0, viewportHeight: 900, theme: 'dark' });
  const darkScrolled = computeHeroCanvasOpacity({ scrollY: 900, viewportHeight: 900, theme: 'dark' });
  assert.equal(darkTop, 0.92);
  assert.equal(darkScrolled, 0.08);

  const lightTop = computeHeroCanvasOpacity({ scrollY: 0, viewportHeight: 900, theme: 'light' });
  const lightScrolled = computeHeroCanvasOpacity({ scrollY: 900, viewportHeight: 900, theme: 'light' });
  assert.equal(lightTop, 0.52);
  assert.equal(lightScrolled, 0.04);
});

test('shouldEnableShell3D and shouldPreloadShell3D restrict 3D Canvas strictly to Home route', () => {
  assert.equal(isPublicShell3DRoute('home'), true);
  assert.equal(isPublicShell3DRoute('projects'), false);
  assert.equal(isPublicShell3DRoute('about'), false);
  assert.equal(isPublicShell3DRoute('academic'), false);
  assert.equal(isPublicShell3DRoute('admin'), false);
  assert.equal(isPublicShell3DRoute('not-found'), false);

  assert.equal(
    shouldEnableShell3D({
      routeName: 'home',
      viewportWidth: 1280,
      prefersReducedMotion: false,
      webglSupported: true,
    }),
    true
  );

  for (const offHome of ['about', 'academic', 'projects', 'milestones', 'notes', 'connect', 'admin', 'not-found'] as const) {
    assert.equal(
      shouldEnableShell3D({
        routeName: offHome,
        viewportWidth: 1440,
        prefersReducedMotion: false,
        webglSupported: true,
      }),
      false
    );
    assert.equal(
      shouldPreloadShell3D({
        routeName: offHome,
        viewportWidth: 1440,
        prefersReducedMotion: false,
        hasWebGLContext: true,
      }),
      false
    );
    assert.equal(
      computeShellCanvasOpacity({ routeName: offHome, scrollY: 0, viewportHeight: 900, theme: 'dark' }),
      0
    );
  }

  assert.equal(
    shouldPreloadShell3D({
      routeName: 'home',
      viewportWidth: 1440,
      prefersReducedMotion: false,
    }),
    true
  );

  assert.equal(
    shouldPreloadShell3D({
      routeName: 'home',
      viewportWidth: DESKTOP_3D_MIN_WIDTH - 1,
      prefersReducedMotion: false,
    }),
    false
  );

  assert.equal(
    shouldPreloadShell3D({
      routeName: 'home',
      viewportWidth: 1440,
      prefersReducedMotion: true,
    }),
    false
  );

  assert.equal(
    shouldPreloadShell3D({
      routeName: 'home',
      viewportWidth: 1440,
      prefersReducedMotion: false,
      hasWebGLContext: false,
    }),
    false
  );
});

