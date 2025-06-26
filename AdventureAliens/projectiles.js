import * as THREE from 'three';

// Dependencies will be injected via setProjectileDependencies
let gameToThreeJS, scene;

export function setProjectileDependencies(dependencies) {
    ({ gameToThreeJS, scene } = dependencies);
}

export class LaserProjectile {
    constructor(x, y, direction) { // Constructor no longer takes dependencies directly
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 5;
        this.speed = 12 * direction;

        const geometry = new THREE.BoxGeometry(this.width, this.height, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0x34d399 }); // Emerald-400
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Use injected scene

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    update() {
        this.x += this.speed;
        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    remove() {
        scene.remove(this.mesh); // Use injected scene
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class PlasmaProjectile {
    constructor(x, y, direction) { // Constructor no longer takes dependencies directly
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 10;
        this.speed = 8 * direction;

        const geometry = new THREE.SphereGeometry(this.width / 2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xf0abfc }); // Fuchsia-300
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Use injected scene

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    update() {
        this.x += this.speed;
        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    remove() {
        scene.remove(this.mesh); // Use injected scene
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class EnemyProjectile {
    constructor(x, y, targetX, targetY) { // Constructor no longer takes dependencies directly
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;

        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        const geometry = new THREE.BoxGeometry(this.width, this.height, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Orange-500
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Use injected scene

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    remove() {
        scene.remove(this.mesh); // Use injected scene
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
