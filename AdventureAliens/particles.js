import * as THREE from 'three';

export class Particle {
    constructor(x, y, color, size, lifespan, speedX, speedY, gameToThreeJS, scene) {
        this.x = x;
        this.y = y;
        this.speedX = speedX || (Math.random() - 0.5) * 3;
        this.speedY = speedY || (Math.random() - 0.5) * 3;
        this.lifespan = lifespan;
        this.maxLifespan = lifespan;
        this.gameToThreeJS = gameToThreeJS;
        this.scene = scene;

        const geometry = new THREE.SphereGeometry(size / 2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifespan--;

        this.mesh.position.copy(this.gameToThreeJS(this.x, this.y));
        this.mesh.material.opacity = this.lifespan / this.maxLifespan;
        this.mesh.material.transparent = true;
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export function createParticles(x, y, color, count, size = 5, lifespan = 30, spread = 3, particlesArray, gameToThreeJS, scene) {
    for (let i = 0; i < count; i++) {
        const particleSize = Math.random() * size + 2;
        const particleLifespan = Math.random() * lifespan + 15;
        const speedX = (Math.random() - 0.5) * spread;
        const speedY = (Math.random() - 0.5) * spread;
        particlesArray.push(new Particle(x, y, color, particleSize, particleLifespan, speedX, speedY, gameToThreeJS, scene));
    }
}
