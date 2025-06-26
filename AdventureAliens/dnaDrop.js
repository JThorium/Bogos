import * as THREE from 'three';

export class DnaDrop {
    constructor(x, y, gameToThreeJS, scene) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.value = Math.floor(Math.random() * 5 + 5); // 5-9 DNA
        this.speedY = 0.5;
        this.gameToThreeJS = gameToThreeJS;
        this.scene = scene;

        const geometry = new THREE.SphereGeometry(this.size / 2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Emerald-500
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    update() {
        this.y += this.speedY;
        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
