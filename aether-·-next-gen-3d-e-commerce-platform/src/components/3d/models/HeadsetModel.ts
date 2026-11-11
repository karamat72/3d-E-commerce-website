import * as THREE from 'three';
import { createProceduralCarbonTexture } from '../threeUtils.js';

export interface ExplodedProductModel extends THREE.Group {
  updateExploded: (factor: number) => void;
  updateColor: (hex: string, finish?: string) => void;
  updateWireframe: (enabled: boolean) => void;
  disposeModel: () => void;
}

export function createHeadsetModel(initialColor = '#1E293B'): ExplodedProductModel {
  const root = new THREE.Group() as ExplodedProductModel;

  const carbonTexture = createProceduralCarbonTexture();

  // Materials
  const titaniumMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialColor),
    metalness: 0.9,
    roughness: 0.22,
    envMapIntensity: 1.4
  });

  const cushionMaterial = new THREE.MeshStandardMaterial({
    color: 0x11141a,
    roughness: 0.85,
    metalness: 0.1,
    envMapIntensity: 0.5
  });

  const driverMaterial = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    metalness: 0.95,
    roughness: 0.15,
    normalMap: carbonTexture,
    envMapIntensity: 2.0
  });

  const glowRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    wireframe: false
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xdde6ed,
    metalness: 0.98,
    roughness: 0.08,
    envMapIntensity: 2.5
  });

  // Track all materials for wireframe toggle
  const allMaterials = [titaniumMaterial, cushionMaterial, driverMaterial, chromeMaterial];

  // Component Groups for Exploded View
  const headbandGroup = new THREE.Group();
  const leftEarcupGroup = new THREE.Group();
  const rightEarcupGroup = new THREE.Group();
  const leftDriverGroup = new THREE.Group();
  const rightDriverGroup = new THREE.Group();
  const leftCushionGroup = new THREE.Group();
  const rightCushionGroup = new THREE.Group();

  /* ---------------- Part 1: Headband Arch ---------------- */
  // Curved Torus Arc
  const headbandGeo = new THREE.TorusGeometry(1.4, 0.07, 16, 64, Math.PI * 0.9);
  const headbandMesh = new THREE.Mesh(headbandGeo, titaniumMaterial);
  headbandMesh.rotation.z = Math.PI * 0.05;
  headbandMesh.position.y = 0.5;
  headbandGroup.add(headbandMesh);

  // Inner floating suspension strap
  const strapGeo = new THREE.TorusGeometry(1.32, 0.03, 12, 48, Math.PI * 0.8);
  const strapMesh = new THREE.Mesh(strapGeo, cushionMaterial);
  strapMesh.rotation.z = Math.PI * 0.1;
  strapMesh.position.y = 0.55;
  headbandGroup.add(strapMesh);

  // Dual Headband Yoke Connectors
  const yokeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.25, 24);
  const leftYoke = new THREE.Mesh(yokeGeo, chromeMaterial);
  leftYoke.position.set(-1.3, 0.55, 0);
  leftYoke.rotation.z = 0.2;
  headbandGroup.add(leftYoke);

  const rightYoke = new THREE.Mesh(yokeGeo, chromeMaterial);
  rightYoke.position.set(1.3, 0.55, 0);
  rightYoke.rotation.z = -0.2;
  headbandGroup.add(rightYoke);

  root.add(headbandGroup);

  /* ---------------- Part 2: Earcups (Left & Right) ---------------- */
  // Left Earcup Shell
  const cupGeo = new THREE.CylinderGeometry(0.72, 0.78, 0.38, 48);
  cupGeo.rotateZ(Math.PI / 2);

  const leftCup = new THREE.Mesh(cupGeo, titaniumMaterial);
  leftEarcupGroup.position.set(-1.35, 0.15, 0);
  leftEarcupGroup.add(leftCup);

  // Outer Carbon Inset Disc
  const discGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.04, 36);
  discGeo.rotateZ(Math.PI / 2);
  const leftCarbonDisc = new THREE.Mesh(discGeo, driverMaterial);
  leftCarbonDisc.position.x = -0.19;
  leftEarcupGroup.add(leftCarbonDisc);

  // Digital Crown Encoder
  const crownGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 24);
  crownGeo.rotateX(Math.PI / 2);
  const leftCrown = new THREE.Mesh(crownGeo, chromeMaterial);
  leftCrown.position.set(-0.1, 0.55, 0.3);
  leftEarcupGroup.add(leftCrown);

  root.add(leftEarcupGroup);

  // Right Earcup Shell
  const rightCup = new THREE.Mesh(cupGeo, titaniumMaterial);
  rightEarcupGroup.position.set(1.35, 0.15, 0);
  rightEarcupGroup.add(rightCup);

  const rightCarbonDisc = new THREE.Mesh(discGeo, driverMaterial);
  rightCarbonDisc.position.x = 0.19;
  rightEarcupGroup.add(rightCarbonDisc);

  const rightCrown = new THREE.Mesh(crownGeo, chromeMaterial);
  rightCrown.position.set(0.1, 0.55, 0.3);
  rightEarcupGroup.add(rightCrown);

  root.add(rightEarcupGroup);

  /* ---------------- Part 3: Planar Drivers & Glowing Rings ---------------- */
  // Left Driver Ring
  const driverGeo = new THREE.TorusGeometry(0.55, 0.06, 16, 48);
  driverGeo.rotateY(Math.PI / 2);
  const leftDriver = new THREE.Mesh(driverGeo, chromeMaterial);
  const leftGlow = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 12, 36).rotateY(Math.PI / 2), glowRingMaterial);
  leftDriverGroup.position.set(-1.45, 0.15, 0);
  leftDriverGroup.add(leftDriver, leftGlow);
  root.add(leftDriverGroup);

  // Right Driver Ring
  const rightDriver = new THREE.Mesh(driverGeo, chromeMaterial);
  const rightGlow = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.02, 12, 36).rotateY(Math.PI / 2), glowRingMaterial);
  rightDriverGroup.position.set(1.45, 0.15, 0);
  rightDriverGroup.add(rightDriver, rightGlow);
  root.add(rightDriverGroup);

  /* ---------------- Part 4: Ear Cushions (Left & Right) ---------------- */
  const cushionGeo = new THREE.TorusGeometry(0.68, 0.22, 24, 48);
  cushionGeo.rotateY(Math.PI / 2);

  const leftCushion = new THREE.Mesh(cushionGeo, cushionMaterial);
  leftCushionGroup.position.set(-1.18, 0.15, 0);
  leftCushionGroup.add(leftCushion);
  root.add(leftCushionGroup);

  const rightCushion = new THREE.Mesh(cushionGeo, cushionMaterial);
  rightCushionGroup.position.set(1.18, 0.15, 0);
  rightCushionGroup.add(rightCushion);
  root.add(rightCushionGroup);

  // Base Positions for Explosion Interpolation
  const basePos = {
    headbandY: 0,
    leftCupX: -1.35,
    rightCupX: 1.35,
    leftDriverX: -1.45,
    rightDriverX: 1.45,
    leftCushionX: -1.18,
    rightCushionX: 1.18
  };

  // Exploded View Displacement
  root.updateExploded = (factor: number) => {
    // Clamp factor 0..1
    const t = Math.max(0, Math.min(1, factor));

    headbandGroup.position.y = basePos.headbandY + t * 0.9;

    leftEarcupGroup.position.x = basePos.leftCupX - t * 0.9;
    rightEarcupGroup.position.x = basePos.rightCupX + t * 0.9;

    leftDriverGroup.position.x = basePos.leftDriverX - t * 1.6;
    rightDriverGroup.position.x = basePos.rightDriverX + t * 1.6;

    leftCushionGroup.position.x = basePos.leftCushionX - t * 0.4;
    rightCushionGroup.position.x = basePos.rightCushionX + t * 0.4;
  };

  // Color & Finish switcher
  root.updateColor = (hex: string, finish = 'Anodized') => {
    titaniumMaterial.color.set(hex);
    if (finish.toLowerCase().includes('gloss') || finish.toLowerCase().includes('chrome')) {
      titaniumMaterial.roughness = 0.12;
      titaniumMaterial.metalness = 0.95;
    } else {
      titaniumMaterial.roughness = 0.25;
      titaniumMaterial.metalness = 0.88;
    }
  };

  root.updateWireframe = (enabled: boolean) => {
    allMaterials.forEach(m => {
      m.wireframe = enabled;
    });
  };

  root.disposeModel = () => {
    carbonTexture.dispose();
    headbandGeo.dispose();
    strapGeo.dispose();
    yokeGeo.dispose();
    cupGeo.dispose();
    discGeo.dispose();
    crownGeo.dispose();
    driverGeo.dispose();
    cushionGeo.dispose();
    allMaterials.forEach(m => m.dispose());
    glowRingMaterial.dispose();
  };

  return root;
}
