import * as THREE from 'three';

// Helper to convert 2D game coordinates to 3D Three.js coordinates
// Assuming game coordinates (0,0) is top-left and canvas.height is max Y
// Three.js (0,0,0) is center, Y-up, Z-out
export function gameToThreeJS(x, y, z = 0) {
    // Adjust for camera's initial offset and Three.js coordinate system
    const threeX = x - window.innerWidth / 2;
    const threeY = (window.innerHeight / 2) - y; // Invert Y
    return new THREE.Vector3(threeX, threeY, z);
}

export function resizeCanvas(camera, renderer) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
