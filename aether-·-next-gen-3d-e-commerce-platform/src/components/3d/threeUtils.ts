import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Detect software WebGL from GPU string as required by Three.js architecture guidelines
export const isSoftwareGl = (() => {
  if (typeof window === 'undefined') return false;
  try {
    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as any).RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
})();

// Reusable math vectors to avoid Garbage Collection inside animation loops
export const _vec3 = new THREE.Vector3();
export const _mat4 = new THREE.Matrix4();
export const _quat = new THREE.Quaternion();
export const _color = new THREE.Color();

// Setup high-performance physical renderer settings
export function setupRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: true
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return renderer;
}

// Generate zero-dependency studio environment texture via PMREM
export function setupStudioEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  scene.environment = envTexture;
  pmremGenerator.dispose();
  roomEnv.dispose();
  return envTexture;
}

// Procedural Carbon-Fiber normal texture generated via HTML5 2D Canvas (Zero 404s!)
export function createProceduralCarbonTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8080ff'; // Flat normal base
  ctx.fillRect(0, 0, size, size);

  const step = 8;
  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      const isEven = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = isEven ? '#6b6bff' : '#9595ff';
      ctx.fillRect(x, y, step, step);

      ctx.fillStyle = isEven ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// Procedural Grid Texture for studio pedestal ground
export function createProceduralGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#07080d';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.lineWidth = 1;

  const step = 32;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Cross hair ticks
  ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
  for (let x = step; x < size; x += step * 2) {
    for (let y = step; y < size; y += step * 2) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
