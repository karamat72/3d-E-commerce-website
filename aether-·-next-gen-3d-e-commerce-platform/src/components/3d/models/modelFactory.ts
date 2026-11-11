import { createHeadsetModel, ExplodedProductModel } from './HeadsetModel.js';
import { createWatchModel } from './WatchModel.js';
import { createDroneModel } from './DroneModel.js';
import { createSphereModel } from './SphereModel.js';

export function createProduct3DModel(type: string, color?: string): ExplodedProductModel {
  switch (type) {
    case 'watch':
      return createWatchModel(color);
    case 'drone':
      return createDroneModel(color);
    case 'sphere':
      return createSphereModel(color);
    case 'cyberdeck':
    case 'glove':
    case 'headset':
    default:
      return createHeadsetModel(color);
  }
}
