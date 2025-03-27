// Add missing Three.js features as shims
import * as THREE from 'three';

// Add BatchedMesh if it doesn't exist
if (!THREE.BatchedMesh) {
  THREE.BatchedMesh = class BatchedMesh extends THREE.Mesh {
    constructor(geometry, material) {
      super(geometry, material);
      this.name = 'BatchedMesh';
      console.warn('Using BatchedMesh shim');
    }
  };
}

export default THREE;
