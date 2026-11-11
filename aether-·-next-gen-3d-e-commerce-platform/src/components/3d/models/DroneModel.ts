import * as THREE from 'three';
import { ExplodedProductModel } from './HeadsetModel.js';

export function createDroneModel(initialColor = '#18181B'): ExplodedProductModel {
  const root = new THREE.Group() as ExplodedProductModel;

  const fuselageMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialColor),
    metalness: 0.85,
    roughness: 0.25,
    envMapIntensity: 1.5
  });

  const rotorRingMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    metalness: 0.9,
    roughness: 0.2
  });

  const goldGimbalMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.95,
    roughness: 0.12,
    envMapIntensity: 2.5
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    ior: 1.6
  });

  const allMaterials = [fuselageMat, rotorRingMat, goldGimbalMat, lensMat];

  // Groups
  const bodyGroup = new THREE.Group();
  const rotorPods = new THREE.Group();
  const gimbalGroup = new THREE.Group();
  const landingSkids = new THREE.Group();

  // Central Aerodynamic Fuselage
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.5, 2.2);
  const bodyMesh = new THREE.Mesh(bodyGeo, fuselageMat);
  bodyMesh.position.y = 0.2;
  bodyGroup.add(bodyMesh);

  // Top Aerodynamic Cowling
  const cowlGeo = new THREE.ConeGeometry(0.8, 1.4, 4);
  cowlGeo.rotateX(-Math.PI / 2);
  const cowlMesh = new THREE.Mesh(cowlGeo, fuselageMat);
  cowlMesh.position.set(0, 0.45, 0);
  bodyGroup.add(cowlMesh);

  root.add(bodyGroup);

  // 4 Toroidal Ducted Rotor Pods
  const podPositions = [
    { x: -1.4, z: 1.2 },
    { x: 1.4, z: 1.2 },
    { x: -1.4, z: -1.2 },
    { x: 1.4, z: -1.2 }
  ];

  podPositions.forEach(pos => {
    const ringGeo = new THREE.TorusGeometry(0.7, 0.08, 16, 36);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, rotorRingMat);
    ringMesh.position.set(pos.x, 0.3, pos.z);
    rotorPods.add(ringMesh);

    // Motor Hub
    const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16);
    const hubMesh = new THREE.Mesh(hubGeo, goldGimbalMat);
    hubMesh.position.set(pos.x, 0.3, pos.z);
    rotorPods.add(hubMesh);

    // Strut to body
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12);
    armGeo.rotateZ(pos.x < 0 ? Math.PI / 3 : -Math.PI / 3);
    const armMesh = new THREE.Mesh(armGeo, fuselageMat);
    armMesh.position.set(pos.x * 0.5, 0.25, pos.z * 0.5);
    bodyGroup.add(armMesh);
  });

  root.add(rotorPods);

  // Front Optical Stabilized Gimbal
  const gimbalGeo = new THREE.SphereGeometry(0.38, 32, 32);
  const gimbalMesh = new THREE.Mesh(gimbalGeo, goldGimbalMat);
  gimbalGroup.position.set(0, -0.05, 1.2);
  gimbalGroup.add(gimbalMesh);

  // Optical Lens Element
  const lensGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 24);
  lensGeo.rotateX(Math.PI / 2);
  const lensMesh = new THREE.Mesh(lensGeo, lensMat);
  lensMesh.position.set(0, 0, 0.25);
  gimbalGroup.add(lensMesh);

  root.add(gimbalGroup);

  // Landing Gear
  const skidGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.0, 12);
  skidGeo.rotateX(Math.PI / 2);

  const leftSkid = new THREE.Mesh(skidGeo, rotorRingMat);
  leftSkid.position.set(-0.8, -0.4, 0);
  landingSkids.add(leftSkid);

  const rightSkid = new THREE.Mesh(skidGeo, rotorRingMat);
  rightSkid.position.set(0.8, -0.4, 0);
  landingSkids.add(rightSkid);

  root.add(landingSkids);

  // Animation methods
  root.updateExploded = (factor: number) => {
    const t = Math.max(0, Math.min(1, factor));
    rotorPods.position.y = t * 1.0;
    rotorPods.scale.set(1 + t * 0.3, 1, 1 + t * 0.3);
    gimbalGroup.position.z = 1.2 + t * 1.1;
    landingSkids.position.y = -t * 0.7;
    bodyGroup.position.y = -t * 0.3;
  };

  root.updateColor = (hex: string) => {
    fuselageMat.color.set(hex);
  };

  root.updateWireframe = (enabled: boolean) => {
    allMaterials.forEach(m => m.wireframe = enabled);
  };

  root.disposeModel = () => {
    bodyGeo.dispose();
    cowlGeo.dispose();
    gimbalGeo.dispose();
    lensGeo.dispose();
    skidGeo.dispose();
    allMaterials.forEach(m => m.dispose());
  };

  return root;
}
