import * as THREE from 'three';

export class LaserProjectile {
    constructor(x, y, direction, gameToThreeJS, scene) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 5;
        this.speed = 12 * direction;
        this.gameToThreeJS = gameToThreeJS;
        this.scene = scene;

        const geometry = new THREE.BoxGeometry(this.width, this.height, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0x34d399 }); // Emerald-400
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    update() {
        this.x += this.speed;
        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class PlasmaProjectile {
    constructor(x, y, direction, gameToThreeJS, scene) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 10;
        this.speed = 8 * direction;
        this.gameToThreeJS = gameToThreeJS;
        this.scene = scene;

        const geometry = new THREE.SphereGeometry(this.width / 2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xf0abfc }); // Fuchsia-300
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    update() {
        this.x += this.speed;
        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export class EnemyProjectile {
    constructor(x, y, targetX, targetY, gameToThreeJS, scene) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.gameToThreeJS = gameToThreeJS;
        this.scene = scene;

        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        const geometry = new THREE.BoxGeometry(this.width, this.height, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Orange-500
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
