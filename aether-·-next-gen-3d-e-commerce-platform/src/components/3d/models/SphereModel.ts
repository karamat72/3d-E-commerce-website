import * as THREE from 'three';
import { ExplodedProductModel } from './HeadsetModel.js';

export function createSphereModel(initialColor = '#475569'): ExplodedProductModel {
  const root = new THREE.Group() as ExplodedProductModel;

  const shellMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialColor),
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 2.2
  });

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.95,
    roughness: 0.15
  });

  const ringGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: false
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
    transmission: 0.6,
    ior: 1.5
  });

  const allMaterials = [shellMat, baseMat, ringGlowMat, glassMat];

  const baseGroup = new THREE.Group();
  const sphereGroup = new THREE.Group();
  const ringGroup = new THREE.Group();
  const waveGroup = new THREE.Group();

  // Induction Base Pedestal
  const baseGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.35, 48);
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -1.2;
  baseGroup.add(baseMesh);

  // Base Light Ring
  const baseLightGeo = new THREE.TorusGeometry(1.3, 0.04, 16, 48);
  baseLightGeo.rotateX(Math.PI / 2);
  const baseLightMesh = new THREE.Mesh(baseLightGeo, ringGlowMat);
  baseLightMesh.position.y = -1.0;
  baseGroup.add(baseLightMesh);

  root.add(baseGroup);

  // Levitating Central Acoustic Sphere
  const sphereGeo = new THREE.SphereGeometry(1.0, 48, 48);
  const sphereMesh = new THREE.Mesh(sphereGeo, shellMat);
  sphereMesh.position.y = 0.4;
  sphereGroup.add(sphereMesh);

  // Top Smoked Glass Cap
  const glassGeo = new THREE.SphereGeometry(0.85, 36, 36, 0, Math.PI * 2, 0, Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.position.y = 0.6;
  sphereGroup.add(glassMesh);

  root.add(sphereGroup);

  // Acoustic Floating Equatorial Ring
  const eqRingGeo = new THREE.TorusGeometry(1.25, 0.06, 16, 48);
  eqRingGeo.rotateX(Math.PI / 2);
  const eqRingMesh = new THREE.Mesh(eqRingGeo, ringGlowMat);
  eqRingMesh.position.y = 0.4;
  ringGroup.add(eqRingMesh);
  root.add(ringGroup);

  // Floating Sound Wave Spheres
  for (let i = 1; i <= 3; i++) {
    const waveGeo = new THREE.TorusGeometry(1.1 + i * 0.35, 0.015, 8, 36);
    waveGeo.rotateX(Math.PI / 2);
    const waveMesh = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5 - i * 0.12
    }));
    waveMesh.position.y = 0.4;
    waveGroup.add(waveMesh);
  }
  root.add(waveGroup);

  // Explosion animation
  root.updateExploded = (factor: number) => {
    const t = Math.max(0, Math.min(1, factor));
    baseGroup.position.y = -t * 0.8;
    sphereGroup.position.y = t * 0.8;
    ringGroup.position.y = t * 1.6;
    waveGroup.scale.set(1 + t * 0.8, 1, 1 + t * 0.8);
  };

  root.updateColor = (hex: string) => {
    shellMat.color.set(hex);
  };

  root.updateWireframe = (enabled: boolean) => {
    allMaterials.forEach(m => m.wireframe = enabled);
  };

  root.disposeModel = () => {
    baseGeo.dispose();
    baseLightGeo.dispose();
    sphereGeo.dispose();
    glassGeo.dispose();
    eqRingGeo.dispose();
    allMaterials.forEach(m => m.dispose());
  };

  return root;
}
