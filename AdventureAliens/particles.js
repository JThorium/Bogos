import * as THREE from 'three';

// Dependencies will be injected via setParticleDependencies
let gameToThreeJS, scene, particlesArray;

export function setParticleDependencies(dependencies) {
    ({ gameToThreeJS, scene, particlesArray } = dependencies);
}

export class Particle {
    constructor(x, y, color, size, lifespan, speedX, speedY) { // Constructor no longer takes dependencies directly
        this.x = x;
        this.y = y;
        this.speedX = speedX || (Math.random() - 0.5) * 3;
        this.speedY = speedY || (Math.random() - 0.5) * 3;
        this.lifespan = lifespan;
        this.maxLifespan = lifespan;

        const geometry = new THREE.SphereGeometry(size / 2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh); // Use injected scene

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifespan--;

        this.mesh.position.copy(gameToThreeJS(this.x, this.y)); // Use injected gameToThreeJS
        this.mesh.material.opacity = this.lifespan / this.maxLifespan;
        this.mesh.material.transparent = true;
    }

    remove() {
        scene.remove(this.mesh); // Use injected scene
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

export function createParticles(x, y, color, count, size = 5, lifespan = 30, spread = 3) { // Remove particlesArray, gameToThreeJS, scene from arguments
    for (let i = 0; i < count; i++) {
        const particleSize = Math.random() * size + 2;
        const particleLifespan = Math.random() * lifespan + 15;
        const speedX = (Math.random() - 0.5) * spread;
        const speedY = (Math.random() - 0.5) * spread;
        particlesArray.push(new Particle(x, y, color, particleSize, particleLifespan, speedX, speedY)); // Use injected particlesArray
    }
}
