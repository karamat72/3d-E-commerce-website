import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { setupRenderer, setupStudioEnvironment, isSoftwareGl } from './threeUtils.js';
import { createHeadsetModel } from './models/HeadsetModel.js';

export const Global3DScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080d, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full block pointer-events-none fixed inset-0 z-0';
    container.appendChild(canvas);

    const renderer = setupRenderer(canvas);
    renderer.setSize(width, height);

    try {
      setupStudioEnvironment(renderer, scene);
    } catch {
      // safe fallback
    }

    // Dynamic Lights
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const cyanRim = new THREE.PointLight(0x06b6d4, 3.5, 20);
    cyanRim.position.set(-6, 2, -2);
    scene.add(cyanRim);

    const amberFill = new THREE.PointLight(0xf59e0b, 2.0, 15);
    amberFill.position.set(6, -2, -1);
    scene.add(amberFill);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // 1. Quantum Floating Dust Particles
    const particleCount = isSoftwareGl ? 300 : 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 26;
      positions[i + 1] = (Math.random() - 0.5) * 26;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      scales[i / 3] = Math.random() * 0.04 + 0.01;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 2. Holographic Gyroscope Orbit Rings
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.02, 16, 64), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.02, 16, 64), ringMat);
    ring2.rotation.x = Math.PI / 3;
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(6.0, 0.02, 16, 64), ringMat);
    ring3.rotation.y = Math.PI / 4;

    ringGroup.add(ring1, ring2, ring3);
    ringGroup.position.set(0, 0, -2);
    scene.add(ringGroup);

    // 3. Hero Interactive Model (Only visible in Hero & Scroll Showcase)
    const heroHeadset = createHeadsetModel('#1E293B');
    heroHeadset.scale.set(0.95, 0.95, 0.95);
    heroHeadset.position.set(1.5, 0.1, 0.5);
    heroHeadset.rotation.y = -0.45;
    scene.add(heroHeadset);

    // Mouse & Scroll Tracking State
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let scrollY = 0;
    let targetScrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth lerp mouse & scroll
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      scrollY += (targetScrollY - scrollY) * 0.08;

      // Scroll fraction of homepage (approx 3000px height)
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, scrollY / docHeight));

      // Rotate particles and rings
      particles.rotation.y = elapsed * 0.02 + scrollY * 0.0005;
      particles.rotation.x = mouseY * 0.1;
      ring1.rotation.z = elapsed * 0.05;
      ring2.rotation.y = elapsed * 0.04;
      ring3.rotation.x = elapsed * 0.03;

      // Hero Headset Scroll Choreography:
      // In Hero (0.0 to 0.15): floating on right side, subtle rotation
      // In Architectural Breakdown (0.15 to 0.40): moves to center-left, explodes in 3D!
      // Deep scroll (> 0.40): moves upward/recedes gracefully into background
      if (scrollProgress < 0.15) {
        // Hero section
        const t = scrollProgress / 0.15;
        heroHeadset.position.x = 1.5 - t * 0.3;
        heroHeadset.position.y = 0.1 + Math.sin(elapsed * 1.5) * 0.08 - t * 0.2;
        heroHeadset.position.z = 0.5 - t * 0.5;
        heroHeadset.rotation.y = -0.45 + mouseX * 0.3 + elapsed * 0.1;
        heroHeadset.rotation.x = 0.1 + mouseY * 0.2;
        heroHeadset.updateExploded(0);
        heroHeadset.visible = true;
      } else if (scrollProgress < 0.45) {
        // Architectural Breakdown Section: Product Explodes in 3D!
        const t = (scrollProgress - 0.15) / 0.30;
        // Peak explosion at 0.5 of this stage
        const explodeAmt = Math.sin(t * Math.PI);
        heroHeadset.position.x = 0.8 - t * 0.4;
        heroHeadset.position.y = -0.1 + Math.sin(elapsed * 1.5) * 0.04;
        heroHeadset.position.z = 0.8;
        heroHeadset.rotation.y = -0.2 + t * 0.8 + mouseX * 0.2;
        heroHeadset.rotation.x = 0.15;
        heroHeadset.updateExploded(explodeAmt);
        heroHeadset.visible = true;
      } else if (scrollProgress < 0.70) {
        // Transition down
        const t = (scrollProgress - 0.45) / 0.25;
        heroHeadset.position.y = -0.1 - t * 4;
        heroHeadset.updateExploded(0);
        heroHeadset.visible = t < 0.8;
      } else {
        heroHeadset.visible = false;
      }

      // Dynamic Camera Parallax
      camera.position.x = mouseX * 0.3;
      camera.position.y = mouseY * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      particleGeo.dispose();
      particleMat.dispose();
      ringMat.dispose();
      heroHeadset.disposeModel();
      renderer.dispose();
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />;
};
