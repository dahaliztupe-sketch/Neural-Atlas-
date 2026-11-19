import * as THREE from 'three';

export interface AstrolabeTextureBundle {
  dialColorMap: THREE.CanvasTexture | null;
  brushedRoughnessMap: THREE.CanvasTexture | null;
  contactGlowMap: THREE.CanvasTexture | null;
  dispose: () => void;
}

/**
 * Generates high-contrast procedural calibration dial, brushed titanium roughness grain,
 * and soft studio contact shadow textures on offscreen 2D canvases (zero external 404 assets).
 */
export function createAstrolabeTextures(
  isDark: boolean,
  maxAnisotropy: number
): AstrolabeTextureBundle {
  if (typeof document === 'undefined') {
    return {
      dialColorMap: null,
      brushedRoughnessMap: null,
      contactGlowMap: null,
      dispose: () => {},
    };
  }

  const anisotropy = Math.max(1, Math.min(maxAnisotropy || 1, 8));

  // 1. Calibrated Azimuth Degree Dial Color Texture (sRGB)
  const dialCanvas = document.createElement('canvas');
  dialCanvas.width = 512;
  dialCanvas.height = 512;
  const dCtx = dialCanvas.getContext('2d');
  if (dCtx) {
    const cx = 256;
    const cy = 256;
    dCtx.clearRect(0, 0, 512, 512);

    // Subtle anodized slate backing
    const bgGrad = dCtx.createRadialGradient(cx, cy, 120, cx, cy, 250);
    bgGrad.addColorStop(0, isDark ? '#090e1c' : '#1e293b');
    bgGrad.addColorStop(1, isDark ? '#121c33' : '#334155');
    dCtx.fillStyle = bgGrad;
    dCtx.beginPath();
    dCtx.arc(cx, cy, 248, 0, Math.PI * 2);
    dCtx.fill();

    // Concentric technical guide hairlines
    dCtx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(226, 232, 240, 0.45)';
    dCtx.lineWidth = 1.5;
    [168, 206, 236].forEach((radius) => {
      dCtx.beginPath();
      dCtx.arc(cx, cy, radius, 0, Math.PI * 2);
      dCtx.stroke();
    });

    // Precision 72 radial tick marks (5-degree increments, accented cardinal ticks)
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 30 === 0;
      const innerR = isCardinal ? 196 : isMajor ? 204 : 214;
      const outerR = 232;

      dCtx.strokeStyle = isCardinal
        ? '#22d3ee'
        : isMajor
        ? '#a78bfa'
        : isDark
        ? 'rgba(148, 163, 184, 0.42)'
        : 'rgba(203, 213, 225, 0.55)';
      dCtx.lineWidth = isCardinal ? 3 : isMajor ? 2 : 1;

      dCtx.beginPath();
      dCtx.moveTo(cx + Math.cos(rad) * innerR, cy + Math.sin(rad) * innerR);
      dCtx.lineTo(cx + Math.cos(rad) * outerR, cy + Math.sin(rad) * outerR);
      dCtx.stroke();
    }
  }
  const dialColorMap = new THREE.CanvasTexture(dialCanvas);
  dialColorMap.colorSpace = THREE.SRGBColorSpace;
  dialColorMap.anisotropy = anisotropy;
  dialColorMap.needsUpdate = true;

  // 2. Anisotropic Brushed Metal Linear Roughness Grain Texture (Linear / NoColorSpace)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rCtx = roughCanvas.getContext('2d');
  if (rCtx) {
    rCtx.fillStyle = '#383838';
    rCtx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y++) {
      const lum = 42 + ((y * 37) % 34);
      rCtx.fillStyle = `rgb(${lum},${lum},${lum})`;
      rCtx.fillRect(0, y, 256, 1);
    }
  }
  const brushedRoughnessMap = new THREE.CanvasTexture(roughCanvas);
  brushedRoughnessMap.wrapS = THREE.RepeatWrapping;
  brushedRoughnessMap.wrapT = THREE.RepeatWrapping;
  brushedRoughnessMap.repeat.set(3, 1);
  brushedRoughnessMap.anisotropy = anisotropy;
  brushedRoughnessMap.needsUpdate = true;

  // 3. Soft Radial Grounding Contact Shadow & Specular Halo (sRGB)
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const gCtx = glowCanvas.getContext('2d');
  if (gCtx) {
    const grad = gCtx.createRadialGradient(128, 128, 8, 128, 128, 126);
    if (isDark) {
      grad.addColorStop(0, 'rgba(34, 211, 238, 0.32)');
      grad.addColorStop(0.35, 'rgba(139, 92, 246, 0.16)');
      grad.addColorStop(0.7, 'rgba(5, 8, 17, 0.45)');
      grad.addColorStop(1, 'rgba(5, 8, 17, 0)');
    } else {
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.24)');
      grad.addColorStop(0.45, 'rgba(109, 40, 217, 0.10)');
      grad.addColorStop(1, 'rgba(244, 246, 251, 0)');
    }
    gCtx.fillStyle = grad;
    gCtx.fillRect(0, 0, 256, 256);
  }
  const contactGlowMap = new THREE.CanvasTexture(glowCanvas);
  contactGlowMap.colorSpace = THREE.SRGBColorSpace;
  contactGlowMap.needsUpdate = true;

  return {
    dialColorMap,
    brushedRoughnessMap,
    contactGlowMap,
    dispose: () => {
      dialColorMap.dispose();
      brushedRoughnessMap.dispose();
      contactGlowMap.dispose();
    },
  };
}
