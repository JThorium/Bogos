import * as THREE from 'three';

// Dependencies will be injected via setDnaDropDependencies
let gameToThreeJS, scene;

export function setDnaDropDependencies(dependencies) {
    ({ gameToThreeJS, scene } = dependencies);
}

export class DnaDrop {
    constructor(x, y) { // Constructor no longer takes dependencies directly
        this.x = x;
        this.y = y;
        this.size = 8;
        this.value = Math.floor(Math.random() * 5 + 5); // 5-9 DNA
        this.speedY = 0.5;

        const geometry = new THREE.SphereGeometry(this.size / 2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Emerald-500
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Use injected scene

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    update() {
        this.y += this.speedY;
        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    remove() {
        scene.remove(this.mesh); // Use injected scene
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
