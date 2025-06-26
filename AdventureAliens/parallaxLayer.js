import * as THREE from 'three';

export class ParallaxLayer {
    constructor(color, speedFactor, size, scene) {
        this.speedFactor = speedFactor;
        this.stars = [];
        this.starMaterial = new THREE.PointsMaterial({ color: color, size: size, sizeAttenuation: false });
        this.scene = scene;

        const starGeometry = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < 200; i++) {
            // Spread stars across a wider area in 3D space
            positions.push(
                (Math.random() * window.innerWidth * 2) - window.innerWidth,
                (Math.random() * window.innerHeight * 2) - window.innerHeight,
                -Math.random() * 500 - 100 // Z-depth for parallax
            );
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.starField = new THREE.Points(starGeometry, this.starMaterial);
        this.scene.add(this.starField);
    }

    update(cameraX) {
        // Move stars relative to cameraX for parallax effect
        // Since cameraX is game world X, we need to convert it to Three.js X
        this.starField.position.x = -cameraX * this.speedFactor;
        // Loop stars if they go off screen
        if (this.starField.position.x > window.innerWidth) {
            this.starField.position.x -= window.innerWidth * 2;
        } else if (this.starField.position.x < -window.innerWidth) {
            this.starField.position.x += window.innerWidth * 2;
        }
    }
}
