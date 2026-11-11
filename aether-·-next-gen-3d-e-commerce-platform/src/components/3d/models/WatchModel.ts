import * as THREE from 'three';
import { ExplodedProductModel } from './HeadsetModel.js';

export function createWatchModel(initialColor = '#0F172A'): ExplodedProductModel {
  const root = new THREE.Group() as ExplodedProductModel;

  const caseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialColor),
    metalness: 0.92,
    roughness: 0.2,
    envMapIntensity: 2.0
  });

  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.1,
    envMapIntensity: 2.2
  });

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    transmission: 0.8,
    ior: 1.77,
    thickness: 0.5
  });

  const holoMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.75
  });

  const braceletMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3
  });

  const allMaterials = [caseMat, bezelMat, crystalMat, holoMat, braceletMat];

  // Groups
  const caseGroup = new THREE.Group();
  const dialGroup = new THREE.Group();
  const crystalGroup = new THREE.Group();
  const holoGroup = new THREE.Group();
  const braceletGroup = new THREE.Group();

  // Watch Case
  const caseGeo = new THREE.CylinderGeometry(1.2, 1.25, 0.4, 48);
  const caseMesh = new THREE.Mesh(caseGeo, caseMat);
  caseGroup.add(caseMesh);

  // Bezel
  const bezelGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 48);
  bezelGeo.rotateX(Math.PI / 2);
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.y = 0.2;
  caseGroup.add(bezelMesh);

  // Crown
  const crownGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 24);
  crownGeo.rotateZ(Math.PI / 2);
  const crownMesh = new THREE.Mesh(crownGeo, bezelMat);
  crownMesh.position.set(1.3, 0.05, 0);
  caseGroup.add(crownMesh);

  root.add(caseGroup);

  // Dial & Inner Tourbillon
  const dialGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.05, 48);
  const dialMesh = new THREE.Mesh(dialGeo, new THREE.MeshStandardMaterial({ color: 0x090a10, roughness: 0.6 }));
  dialMesh.position.y = 0.15;
  dialGroup.add(dialMesh);

  // Minute Markers / Gear
  const gearGeo = new THREE.TorusGeometry(0.8, 0.04, 12, 36);
  gearGeo.rotateX(Math.PI / 2);
  const gearMesh = new THREE.Mesh(gearGeo, bezelMat);
  gearMesh.position.y = 0.18;
  dialGroup.add(gearMesh);

  root.add(dialGroup);

  // Holographic Floating Dial Ring
  const holoRingGeo = new THREE.TorusGeometry(1.0, 0.05, 8, 32);
  holoRingGeo.rotateX(Math.PI / 2);
  const holoRingMesh = new THREE.Mesh(holoRingGeo, holoMat);
  holoRingMesh.position.y = 0.55;
  holoGroup.add(holoRingMesh);

  // Inner hologram glyph
  const holoInnerGeo = new THREE.RingGeometry(0.3, 0.6, 24);
  holoInnerGeo.rotateX(Math.PI / 2);
  const holoInnerMesh = new THREE.Mesh(holoInnerGeo, holoMat);
  holoInnerMesh.position.y = 0.55;
  holoGroup.add(holoInnerMesh);

  root.add(holoGroup);

  // Sapphire Glass Cover
  const crystalGeo = new THREE.CylinderGeometry(1.16, 1.16, 0.06, 48);
  const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
  crystalMesh.position.y = 0.3;
  crystalGroup.add(crystalMesh);
  root.add(crystalGroup);

  // Bracelet Links
  const linkCount = 8;
  for (let i = 0; i < linkCount; i++) {
    const linkGeo = new THREE.BoxGeometry(1.4 - i * 0.08, 0.12, 0.35);
    const topLink = new THREE.Mesh(linkGeo, braceletMat);
    topLink.position.set(0, -0.05 - i * 0.1, 1.35 + i * 0.28);
    topLink.rotation.x = 0.15 * i;
    braceletGroup.add(topLink);

    const bottomLink = new THREE.Mesh(linkGeo, braceletMat);
    bottomLink.position.set(0, -0.05 - i * 0.1, -1.35 - i * 0.28);
    bottomLink.rotation.x = -0.15 * i;
    braceletGroup.add(bottomLink);
  }
  root.add(braceletGroup);

  // Rotation & Explosion animation
  root.updateExploded = (factor: number) => {
    const t = Math.max(0, Math.min(1, factor));
    crystalGroup.position.y = t * 1.2;
    holoGroup.position.y = t * 1.8;
    dialGroup.position.y = -t * 0.5;
    braceletGroup.position.z = t * 0.8;
  };

  root.updateColor = (hex: string) => {
    caseMat.color.set(hex);
  };

  root.updateWireframe = (enabled: boolean) => {
    allMaterials.forEach(m => m.wireframe = enabled);
  };

  root.disposeModel = () => {
    caseGeo.dispose();
    bezelGeo.dispose();
    crystalGeo.dispose();
    dialGeo.dispose();
    holoRingGeo.dispose();
    allMaterials.forEach(m => m.dispose());
  };

  return root;
}
