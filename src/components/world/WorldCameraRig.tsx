import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HERO_BASE_ANCHOR } from './worldAnchors';
import { hasDampingDelta } from './worldCapability';

interface WorldCameraRigProps {
  prefersReducedMotion: boolean;
  isHeroRoute?: boolean;
  isSoftwareGl?: boolean;
}

// Pre-allocated scratch vectors outside animation loop (zero per-frame GC churn)
const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();

export const WorldCameraRig: React.FC<WorldCameraRigProps> = ({
  prefersReducedMotion,
  isHeroRoute = true,
  isSoftwareGl = false,
}) => {
  const { camera, invalidate } = useThree();

  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollRatioRef = useRef<number>(0);

  const currentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...HERO_BASE_ANCHOR.position));
  const currentTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(...HERO_BASE_ANCHOR.target));
  const isFirstMountRef = useRef<boolean>(true);

  useEffect(() => {
    const updateScroll = () => {
      const y = window.scrollY || 0;
      const vh = Math.max(window.innerHeight || 1, 1);
      scrollRatioRef.current = Math.min(Math.max(y / vh, 0), 1);
      if (isSoftwareGl) invalidate();
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, [isSoftwareGl, invalidate]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = -(e.clientY / Math.max(window.innerHeight, 1)) * 2 + 1;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
      if (isSoftwareGl) invalidate();
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [prefersReducedMotion, isSoftwareGl, invalidate]);

  useFrame((state, delta) => {
    const pointer = pointerRef.current;
    const scrollRatio = scrollRatioRef.current;

    const pxOffset = prefersReducedMotion ? 0 : pointer.x * (isHeroRoute ? 0.34 : 0.16);
    const pyOffset = prefersReducedMotion ? 0 : pointer.y * (isHeroRoute ? 0.22 : 0.1);
    const routeDepthOffset = isHeroRoute ? 0 : 1.5;

    _desiredPos.set(
      HERO_BASE_ANCHOR.position[0] + pxOffset,
      HERO_BASE_ANCHOR.position[1] + pyOffset - scrollRatio * 0.48,
      HERO_BASE_ANCHOR.position[2] + scrollRatio * 0.75 + routeDepthOffset
    );
    _desiredTarget.set(
      HERO_BASE_ANCHOR.target[0] + pxOffset * 0.16,
      HERO_BASE_ANCHOR.target[1] + pyOffset * 0.14 - scrollRatio * 0.22,
      HERO_BASE_ANCHOR.target[2]
    );

    if (isFirstMountRef.current || prefersReducedMotion) {
      currentPosRef.current.copy(_desiredPos);
      currentTargetRef.current.copy(_desiredTarget);
      isFirstMountRef.current = false;
    } else {
      const dt = Math.min(delta, 0.1);
      const dampLambda = isSoftwareGl ? 16 : 4.2;
      currentPosRef.current.x = THREE.MathUtils.damp(currentPosRef.current.x, _desiredPos.x, dampLambda, dt);
      currentPosRef.current.y = THREE.MathUtils.damp(currentPosRef.current.y, _desiredPos.y, dampLambda, dt);
      currentPosRef.current.z = THREE.MathUtils.damp(currentPosRef.current.z, _desiredPos.z, dampLambda, dt);

      currentTargetRef.current.x = THREE.MathUtils.damp(currentTargetRef.current.x, _desiredTarget.x, dampLambda, dt);
      currentTargetRef.current.y = THREE.MathUtils.damp(currentTargetRef.current.y, _desiredTarget.y, dampLambda, dt);
      currentTargetRef.current.z = THREE.MathUtils.damp(currentTargetRef.current.z, _desiredTarget.z, dampLambda, dt);

      if (isSoftwareGl) {
        const settling =
          hasDampingDelta(currentPosRef.current.x, _desiredPos.x) ||
          hasDampingDelta(currentPosRef.current.y, _desiredPos.y) ||
          hasDampingDelta(currentPosRef.current.z, _desiredPos.z) ||
          hasDampingDelta(currentTargetRef.current.x, _desiredTarget.x) ||
          hasDampingDelta(currentTargetRef.current.y, _desiredTarget.y) ||
          hasDampingDelta(currentTargetRef.current.z, _desiredTarget.z);
        if (settling) {
          state.invalidate();
        }
      }
    }

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentTargetRef.current);
  });

  return null;
};
