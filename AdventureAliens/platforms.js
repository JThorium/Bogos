import * as THREE from 'three';

// Global variables that will be passed from the main game file
let gameToThreeJS;
let scene;
let cameraX;
let platforms;

export function setPlatformDependencies(deps) {
    gameToThreeJS = deps.gameToThreeJS;
    scene = deps.scene;
    cameraX = deps.cameraX;
    platforms = deps.platforms;
}

export const PLATFORM_CHUNK_WIDTH = 1000;
export let lastPlatformX = 0;
export let platformPatterns = [
    [
        { xOffset: 100, yOffset: 100, width: 100, height: 20 },
        { xOffset: 250, yOffset: 180, width: 120, height: 20 },
        { xOffset: 400, yOffset: 100, width: 100, height: 20 },
        { xOffset: 550, yOffset: 220, width: 80, height: 20 },
    ],
    [
        { xOffset: 0, yOffset: 0, width: 300, height: 40 },
        { xOffset: 400, yOffset: 200, width: 80, height: 20 },
        { xOffset: 550, yOffset: 100, width: 150, height: 20 },
        { xOffset: 750, yOffset: 0, width: 200, height: 40 },
    ],
    [
        { xOffset: 0, yOffset: 0, width: 200, height: 40 },
        { xOffset: 250, yOffset: -50, width: 100, height: 20 },
        { xOffset: 400, yOffset: -100, width: 100, height: 20 },
        { xOffset: 550, yOffset: -150, width: 100, height: 20 },
        { xOffset: 700, yOffset: -200, width: 150, height: 20 },
    ],
    [
        { xOffset: 50, yOffset: 0, width: 80, height: 20 },
        { xOffset: 150, yOffset: 50, width: 80, height: 20 },
        { xOffset: 250, yOffset: 100, width: 80, height: 20 },
        { xOffset: 350, yOffset: 150, width: 80, height: 20 },
        { xOffset: 450, yOffset: 200, width: 80, height: 20 },
    ]
];
export let currentPatternIndex = 0;

export function generateNewPlatforms() {
    if (cameraX + window.innerWidth > lastPlatformX - 200) {
        const currentChunkStart = lastPlatformX;

        const groundPlatform = { x: currentChunkStart, y: window.innerHeight - 40, width: 200, height: 40 };
        platforms.push(groundPlatform);
        addPlatformMesh(groundPlatform); // Add Three.js mesh
        lastPlatformX = currentChunkStart + 200;

        const pattern = platformPatterns[currentPatternIndex];
        pattern.forEach(p => {
            const newPlatform = {
                x: lastPlatformX + p.xOffset,
                y: window.innerHeight - 40 - p.yOffset,
                width: p.width,
                height: p.height
            };
            platforms.push(newPlatform);
            addPlatformMesh(newPlatform); // Add Three.js mesh
        });
        lastPlatformX += PLATFORM_CHUNK_WIDTH;

        currentPatternIndex = (currentPatternIndex + 1) % platformPatterns.length;
    }
}

export function addPlatformMesh(platform) {
    const geometry = new THREE.BoxGeometry(platform.width, platform.height, 50); // Give platforms some depth
    const material = new THREE.MeshBasicMaterial({ color: 0x4a044e }); // Dark purple
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(gameToThreeJS(platform.x + platform.width / 2, platform.y + platform.height / 2, -25)); // Center and push back slightly
    platform.mesh = mesh; // Store mesh reference
    scene.add(mesh);
}

export function checkPlatformCollisions(player, platforms) {
    let onAnyPlatform = false;
    for (const platform of platforms) {
        // Simple AABB collision for now
        if (player.x < platform.x + platform.width && player.x + player.width > platform.x &&
            player.y < platform.y + platform.height && player.y + player.height > platform.y &&
            player.vy >= 0 && (player.y + player.height - player.vy) <= platform.y + 1) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.isOnGround = true;
            onAnyPlatform = true;
            break;
        }
    }
    if (onAnyPlatform && player.vy === 0) {
        player.jumps = 0;
    }
}
