
// Converts a 2D wireframe model definition (vertices and edges) into a Three.js LineSegments object
export function createWireframeModel(model, color, scale = 1, rotation = { x: 0, y: 0, z: 0 }) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    // Create a mapping from original vertex index to its position in the 'positions' array
    const vertexMap = new Map();
    model.vertices.forEach((v, i) => {
        vertexMap.set(i, positions.length / 3); // Store the start index of this vertex's coordinates
        positions.push(v.x, v.y, v.z);
    });

    const indices = [];
    model.edges.forEach(edge => {
        const startVertexIndex = edge[0];
        const endVertexIndex = edge[1];
        indices.push(startVertexIndex, endVertexIndex);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);

    const material = new THREE.LineBasicMaterial({ color: color });
    const wireframe = new THREE.LineSegments(geometry, material);

    wireframe.scale.set(scale, scale, scale);
    wireframe.rotation.set(rotation.x, rotation.y, rotation.z);

    return wireframe;
}

// Converts a hex color string to a Three.js Color object
export function hexToThreeColor(hex) {
    return new THREE.Color(hex);
}

// Converts game coordinates to Three.js coordinates
// Assuming a game screen of 1000x800 and a camera at z=100 looking at 0,0,0
// The center of the screen (500, 400) maps to (0, 0) in Three.js
// Y-axis is inverted in game vs Three.js (up is positive in Three.js, down is positive in game)
export function gameToThreeCoords(x, y, z = 0, screenWidth, screenHeight, cameraZ) {
    const threeX = x - (screenWidth / 2);
    const threeY = (screenHeight / 2) - y; // Invert Y
    const threeZ = z; // Use original Z if provided, otherwise default to 0

    // Adjust for perspective if necessary. For now, assume simple mapping.
    return new THREE.Vector3(threeX, threeY, threeZ);
}
