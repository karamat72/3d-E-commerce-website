import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupRenderer, setupStudioEnvironment, isSoftwareGl } from './threeUtils.js';
import { createProduct3DModel } from './models/modelFactory.js';
import { ExplodedProductModel } from './models/HeadsetModel.js';
import { sound } from '../../utils/audio.js';
import { Layers, RotateCcw, Box, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface Product3DViewerProps {
  modelType: string;
  initialColor?: string;
  variants?: Array<{
    id: string;
    name: string;
    colorHex: string;
    finish: string;
  }>;
  onColorChange?: (colorHex: string) => void;
  className?: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
  modelType,
  initialColor = '#1E293B',
  variants = [],
  onColorChange,
  className = 'w-full h-[520px]'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<ExplodedProductModel | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // UI state for bottom collapsible dock
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);

  // Sync color changes to model
  const handleColorSelect = useCallback((hex: string, finishName?: string) => {
    setSelectedColor(hex);
    sound.playClick();
    if (modelRef.current) {
      modelRef.current.updateColor(hex, finishName);
    }
    if (onColorChange) {
      onColorChange(hex);
    }
  }, [onColorChange]);

  const handleExplosionChange = useCallback((val: number) => {
    setExplodedFactor(val);
    if (modelRef.current) {
      modelRef.current.updateExploded(val);
    }
  }, []);

  const toggleAutoRotate = useCallback(() => {
    sound.playClick();
    setAutoRotate(prev => {
      const next = !prev;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next && !isSoftwareGl;
      }
      return next;
    });
  }, []);

  const toggleWireframe = useCallback(() => {
    sound.playClick();
    setWireframe(prev => {
      const next = !prev;
      if (modelRef.current) {
        modelRef.current.updateWireframe(next);
      }
      return next;
    });
  }, []);

  const resetCamera = useCallback(() => {
    sound.playClick();
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Create scene, camera, renderer
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.0);

    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full block cursor-grab active:cursor-grabbing';
    container.appendChild(canvas);

    const renderer = setupRenderer(canvas);
    renderer.setSize(width, height);

    // Studio Environment map via RoomEnvironment
    try {
      setupStudioEnvironment(renderer, scene);
    } catch (e) {
      console.warn('RoomEnvironment fallback:', e);
    }

    // 3-point Studio Lighting
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x090a10, 0.6);
    scene.add(hemiLight);

    // Contact Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.5;
    scene.add(shadowMesh);

    // Ground Grid Halo Ring
    const haloGeo = new THREE.RingGeometry(1.6, 1.62, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.y = -1.49;
    scene.add(haloMesh);

    // Create 3D Model instance
    const productModel = createProduct3DModel(modelType, selectedColor);
    scene.add(productModel);
    modelRef.current = productModel;

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate && !isSoftwareGl;
    controls.autoRotateSpeed = 1.2;
    controls.minDistance = 2.5;
    controls.maxDistance = 8.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip below pedestal
    controlsRef.current = controls;

    // Responsive resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (controls.enabled) {
        controls.update();
      }

      // Subtle levitation bob when not exploded
      if (explodedFactor < 0.05 && productModel) {
        productModel.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (productModel.disposeModel) {
        productModel.disposeModel();
      }
      scene.remove(productModel);
      renderer.dispose();
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [modelType]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#090b12] border border-white/10 ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Subtle Top-Left Spec Badge (Unobtrusive) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-200">Interactive 360° Inspection</span>
        <span className="text-slate-600">·</span>
        <span>Drag to Rotate · Scroll to Zoom</span>
      </div>

      {/* Unified Bottom Control Dock (Compliant with Three.js Skill Section 5) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl transition-all duration-300 ease-out ${
          isDockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Dock Header & Collapse Toggle */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => {
              sound.playClick();
              setIsDockCollapsed(!isDockCollapsed);
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900/80 backdrop-blur-md rounded-t-lg border-t border-x border-white/10 cursor-pointer transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Show 3D Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Controls (Cinema Mode)</span>
              </>
            )}
          </button>
        </div>

        {/* Dock Content Panel */}
        <div className="glass-panel p-3 rounded-xl border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Exploded View Control */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-medium text-slate-300 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exploded View</span>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodedFactor}
              onChange={(e) => handleExplosionChange(parseFloat(e.target.value))}
              className="w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="font-mono text-[11px] text-cyan-400 w-8 tabular-nums">
              {Math.round(explodedFactor * 100)}%
            </span>
          </div>

          {/* Color & Material Finish Swatches */}
          {variants.length > 0 && (
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Finish:</span>
              {variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleColorSelect(v.colorHex, v.finish)}
                  title={`${v.name} (${v.finish})`}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                    selectedColor.toLowerCase() === v.colorHex.toLowerCase()
                      ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-110'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: v.colorHex }}
                />
              ))}
            </div>
          )}

          {/* Viewport Action Buttons */}
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <button
              onClick={toggleAutoRotate}
              title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                autoRotate
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleWireframe}
              title="Toggle Wireframe Blueprint"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                wireframe
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetCamera}
              title="Reset Camera View"
              className="px-2 py-1 bg-slate-800/60 hover:bg-slate-800 border border-white/5 rounded-lg text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
