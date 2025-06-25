// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

let score = 0;
let pelts = 0; // New variable for collected pelts
let gameTime = 60; // seconds
let lastTime = 0;
let animals = [];
const ANIMAL_SPAWN_INTERVAL = 1000; // milliseconds (increased frequency)
let lastAnimalSpawnTime = 0;
let scorePopups = []; // Array to hold score pop-up objects

// Gun Definitions
const GUNS = {
    SHOTGUN: {
        name: "Shotgun",
        damage: 1, // Multiplier for animal points
        reloadTime: 2000,
        ammoCapacity: 5,
        pellets: 5, // For shotgun spread
        spread: 0.1 // Radians
    },
    RIFLE: {
        name: "Rifle",
        damage: 1.5,
        reloadTime: 1000,
        ammoCapacity: 10,
        pellets: 1,
        spread: 0
    },
    SNIPER: {
        name: "Sniper Rifle",
        damage: 3,
        reloadTime: 3000,
        ammoCapacity: 1,
        pellets: 1,
        spread: 0
    }
};
let currentGun = GUNS.SHOTGUN; // Default gun

let ammo = currentGun.ammoCapacity;
const MAX_AMMO = currentGun.ammoCapacity; // This will be dynamically updated
const RELOAD_TIME = currentGun.reloadTime; // milliseconds (This will be dynamically updated)
let reloading = false;
let reloadTimer = 0;

// Define planes for depth perception
const PLANES = [
    { y_min: GAME_HEIGHT * 0.6, y_max: GAME_HEIGHT * 0.7, size_multiplier: 0.6, speed_multiplier: 0.8, name: "far" },
    { y_min: GAME_HEIGHT * 0.5, y_max: GAME_HEIGHT * 0.6, size_multiplier: 0.8, speed_multiplier: 1.0, name: "mid-far" },
    { y_min: GAME_HEIGHT * 0.4, y_max: GAME_HEIGHT * 0.5, size_multiplier: 1.0, speed_multiplier: 1.2, name: "mid" },
    { y_min: GAME_HEIGHT * 0.3, y_max: GAME_HEIGHT * 0.4, size_multiplier: 1.2, speed_multiplier: 1.4, name: "mid-near" },
    { y_min: GAME_HEIGHT * 0.2, y_max: GAME_HEIGHT * 0.3, size_multiplier: 1.4, speed_multiplier: 1.6, name: "near" }
];

// Game State
const GAME_STATE = {
    MENU: 0,
    RUNNING: 1,
    GAMEOVER: 2,
    LOADOUT: 3 // New state for loadout configuration
};
let currentState = GAME_STATE.MENU;
let highScores = []; // Array to hold high scores

// Mouse and Shot variables for crosshair and shooting animation
let mouseX = 0;
let mouseY = 0;
let shotFired = false;
let shotX = 0;
let shotY = 0;
let shotAlpha = 0;

// Animal Class
class Animal {
    constructor(type, x, y, size, speed, points, plane) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.points = points;
        this.plane = plane; // Store the plane this animal belongs to
        this.direction = Math.random() < 0.5 ? 1 : -1; // 1 for right, -1 for left
        this.fleeing = false;
        this.hiding = false; // New property for hiding behavior
        this.hideTimer = 0; // Timer for how long an animal hides
        this.maxHideTime = 3000; // Max hide time in ms
    }

    draw() {
        ctx.fillStyle = this.getColor();
        ctx.save(); // Save the current canvas state
        // Adjust y position slightly based on plane for visual depth
        const displayY = this.y + (this.plane.y_max - this.plane.y_min) / 2;
        ctx.translate(this.x, displayY); // Move origin to animal's center

        switch (this.type.toLowerCase()) {
            case "deer":
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
            case "rabbit":
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case "bear":
                ctx.beginPath();
                ctx.moveTo(0, -this.size / 2);
                ctx.lineTo(-this.size / 2, this.size / 2);
                ctx.lineTo(this.size / 2, this.size / 2);
                ctx.closePath();
                ctx.fill();
                break;
            case "bird":
                // Simple triangle for bird
                ctx.beginPath();
                ctx.moveTo(0, -this.size / 2);
                ctx.lineTo(-this.size, this.size / 2);
                ctx.lineTo(this.size, this.size / 2);
                ctx.closePath();
                ctx.fill();
                break;
            case "squirrel":
                // Small circle for squirrel
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case "groundhog":
                // Oval for groundhog
                ctx.ellipse(0, 0, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            case "beaver":
                // Rectangle with a flat tail for beaver
                ctx.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 2 / 3);
                ctx.fillRect(this.size / 2, 0, this.size / 3, this.size / 4); // Tail
                break;
            default:
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type, 0, 5); // Text relative to new origin
        ctx.restore(); // Restore the canvas state
    }

    update(deltaTime) {
        if (this.hiding) {
            this.hideTimer -= deltaTime;
            if (this.hideTimer <= 0) {
                this.hiding = false;
                // Re-enter from the side it was hiding towards
                this.x = this.direction === 1 ? -this.size / 2 : GAME_WIDTH + this.size / 2;
                this.y = this.plane.y_min + Math.random() * (this.plane.y_max - this.plane.y_min);
            }
            return false; // Hiding animals don't move or get removed
        }

        if (this.fleeing) {
            const centerX = GAME_WIDTH / 2;
            const centerY = GAME_HEIGHT / 2;
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const angle = Math.atan2(dy, dx);

            this.x += Math.cos(angle) * this.speed * 2 * (deltaTime / 1000);
            this.y += Math.sin(angle) * this.speed * 2 * (deltaTime / 1000);

            if (this.x < -this.size * 2 || this.x > GAME_WIDTH + this.size * 2 ||
                this.y < -this.size * 2 || this.y > GAME_HEIGHT + this.size * 2) {
                return true;
            }
        } else {
            this.x += this.speed * this.direction * (deltaTime / 1000);

            // Check for hiding spots (burrows, trees, rocks)
            const burrows = [
                { x: GAME_WIDTH * 0.25, y: GAME_HEIGHT * 0.85, radiusX: 60, radiusY: 30 },
                { x: GAME_WIDTH * 0.6, y: GAME_HEIGHT * 0.9, radiusX: 70, radiusY: 35 }
            ];

            // Only groundhogs and beavers use burrows
            if ((this.type === "groundhog" || this.type === "beaver") && !this.hiding) {
                for (const burrow of burrows) {
                    const distToBurrow = Math.sqrt(
                        (this.x - burrow.x) * (this.x - burrow.x) +
                        (this.y - burrow.y) * (this.y - burrow.y)
                    );
                    if (distToBurrow < this.size + burrow.radiusX / 2) { // If close to a burrow
                        this.hiding = true;
                        this.hideTimer = this.maxHideTime;
                        return false; // Don't remove, just hide
                    }
                }
            }

            // Remove animal if it goes completely off-screen on the opposite side
            if (this.direction === 1 && this.x - this.size / 2 > GAME_WIDTH) {
                return true;
            }
            if (this.direction === -1 && this.x + this.size / 2 < 0) {
                return true;
            }
        }
        return false;
    }

    getColor() {
        switch (this.type.toLowerCase()) {
            case "deer": return "brown";
            case "rabbit": return "grey";
            case "bear": return "black";
            case "bird": return "skyblue";
            case "squirrel": return "orange";
            case "groundhog": return "darkgrey";
            case "beaver": return "darkorange";
            default: return "purple";
        }
    }

    isClicked(mouseX, mouseY) {
        const distance = Math.sqrt(
            (mouseX - this.x) * (mouseX - this.x) +
            (mouseY - this.y) * (mouseY - this.y)
        );
        return distance < this.size / 2;
    }
}

// Game Functions
function spawnAnimal() {
    const animalTypes = ["deer", "rabbit", "bear", "bird", "squirrel", "groundhog", "beaver"];
    const randomType = animalTypes[Math.floor(Math.random() * animalTypes.length)];

    let randomPlane;
    // Birds can spawn in any plane, others only in ground planes
    if (randomType === "bird") {
        randomPlane = PLANES[Math.floor(Math.random() * PLANES.length)];
    } else {
        // Ground animals should stick to lower planes
        randomPlane = PLANES[Math.floor(Math.random() * (PLANES.length - 2))]; // Exclude top two planes for ground animals
    }

    const baseSize = 40;
    const size = baseSize * randomPlane.size_multiplier;
    const baseSpeed = 30 + Math.random() * 70;
    const speed = baseSpeed * randomPlane.speed_multiplier;

    // Spawn off-screen
    const direction = Math.random() < 0.5 ? 1 : -1; // 1 for right, -1 for left
    const x = direction === 1 ? -size / 2 : GAME_WIDTH + size / 2; // Start left or right
    const y = randomPlane.y_min + Math.random() * (randomPlane.y_max - randomPlane.y_min);

    let points;
    switch (randomType) {
        case "deer": points = 100; break;
        case "rabbit": points = 50; break;
        case "bear": points = 200; break;
        case "bird": points = 75; break;
        case "squirrel": points = 60; break;
        case "groundhog": points = 40; break;
        case "beaver": points = 90; break;
    }

    const newAnimal = new Animal(randomType, x, y, size, speed, points, randomPlane);
    newAnimal.direction = direction; // Set initial direction
    animals.push(newAnimal);
}

// High Score Functions
async function loadHighScores() {
    try {
        const response = await fetch('highscores.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        highScores = await response.json();
        highScores.sort((a, b) => b.score - a.score); // Sort descending
        highScores = highScores.slice(0, 5); // Keep top 5
    } catch (error) {
        console.error("Could not load high scores:", error);
        highScores = []; // Initialize as empty if loading fails
    }
}

async function saveHighScore(newScore) {
    highScores.push({ score: newScore, date: new Date().toLocaleString() });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5); // Keep top 5

    // In a real application, this would send data to a server.
    // For a client-side only game, we can't directly write to a file.
    // This part would require a backend. For now, it will just update the in-memory array.
    console.log("High Scores updated (in-memory):", highScores);
    // To persist, you'd need a server endpoint:
    /*
    try {
        await fetch('/save-highscore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(highScores),
        });
    } catch (error) {
        console.error("Could not save high scores:", error);
    }
    */
}

function draw() {
    // Draw background (sky)
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.fillRect(0, GAME_HEIGHT * 0.7, GAME_WIDTH, GAME_HEIGHT * 0.3); // Ground covers bottom 30%

    // Draw static environmental elements (trees, rocks)
    // Simple trees
    ctx.fillStyle = 'brown'; // Tree trunk
    ctx.fillRect(GAME_WIDTH * 0.15, GAME_HEIGHT * 0.5, 20, GAME_HEIGHT * 0.2);
    ctx.fillRect(GAME_WIDTH * 0.7, GAME_HEIGHT * 0.45, 25, GAME_HEIGHT * 0.25);
    ctx.fillStyle = 'darkgreen'; // Tree leaves
    ctx.beginPath();
    ctx.arc(GAME_WIDTH * 0.15 + 10, GAME_HEIGHT * 0.5, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(GAME_WIDTH * 0.7 + 12.5, GAME_HEIGHT * 0.45, 50, 0, Math.PI * 2);
    ctx.fill();

    // Simple rocks
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(GAME_WIDTH * 0.3, GAME_HEIGHT * 0.75, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(GAME_WIDTH * 0.85, GAME_HEIGHT * 0.8, 40, 0, Math.PI * 2);
    ctx.fill();

    // Simple burrows
    ctx.fillStyle = '#8B4513'; // Brown for burrow
    ctx.beginPath();
    ctx.ellipse(GAME_WIDTH * 0.25, GAME_HEIGHT * 0.85, 60, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(GAME_WIDTH * 0.6, GAME_HEIGHT * 0.9, 70, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    if (currentState === GAME_STATE.MENU) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Hunting Game', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText('Click to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
        ctx.fillText('Press L for Loadout', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60); // Option to go to loadout, adjusted Y
    } else if (currentState === GAME_STATE.RUNNING) {
        // Draw animals, sorted by plane (near to far) for correct layering
        animals.sort((a, b) => b.plane.size_multiplier - a.plane.size_multiplier);
        animals.forEach(animal => animal.draw());

        // Draw score and timer
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial'; // Slightly larger font for main stats
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 20, 40);
        ctx.fillText(`Pelts: ${pelts}`, 20, 70); // Display pelts

        ctx.textAlign = 'right';
        ctx.fillText(`Time: ${Math.max(0, Math.floor(gameTime))}`, GAME_WIDTH - 20, 40);

        // Draw ammo and weapon info
        ctx.textAlign = 'center';
        ctx.font = '24px Arial';
        ctx.fillText(`Ammo: ${ammo}/${currentGun.ammoCapacity}`, GAME_WIDTH / 2, 40);
        ctx.font = '20px Arial';
        ctx.fillText(`Weapon: ${currentGun.name}`, GAME_WIDTH / 2, 70);
        if (reloading) {
            ctx.fillStyle = 'orange';
            ctx.font = '20px Arial';
            ctx.fillText(`Reloading... ${(reloadTimer / 1000).toFixed(1)}s`, GAME_WIDTH / 2, 100);
        }

        // Draw score pop-ups
        scorePopups.forEach(popup => {
            ctx.fillStyle = `rgba(0, 0, 0, ${popup.alpha})`; // Black text, fading out
            ctx.font = `${popup.fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(`+${popup.points}`, popup.x, popup.y);
        });

        // Draw crosshair
        ctx.strokeStyle = 'lime'; // Brighter color
        ctx.lineWidth = 3; // Thicker line
        ctx.beginPath();
        ctx.moveTo(mouseX - 15, mouseY); // Longer lines
        ctx.lineTo(mouseX + 15, mouseY);
        ctx.moveTo(mouseX, mouseY - 15);
        ctx.lineTo(mouseX, mouseY + 15);
        ctx.stroke();

        // Draw shot feedback
        if (shotFired) {
            ctx.fillStyle = `rgba(255, 255, 255, ${shotAlpha})`;
            ctx.beginPath();
            ctx.arc(shotX, shotY, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw reload button
        ctx.fillStyle = reloading ? 'darkgrey' : 'lightgrey';
        ctx.fillRect(RELOAD_BUTTON_X, RELOAD_BUTTON_Y, RELOAD_BUTTON_WIDTH, RELOAD_BUTTON_HEIGHT);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(RELOAD_BUTTON_X, RELOAD_BUTTON_Y, RELOAD_BUTTON_WIDTH, RELOAD_BUTTON_HEIGHT);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Reload (R)', RELOAD_BUTTON_X + RELOAD_BUTTON_WIDTH / 2, RELOAD_BUTTON_Y + RELOAD_BUTTON_HEIGHT / 2 + 7);

    } else if (currentState === GAME_STATE.GAMEOVER) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
        ctx.font = '30px Arial';
        ctx.fillText(`Final Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
        ctx.fillText('Press L for Loadout', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80); // Option to go to loadout

        // Display High Scores on Game Over screen
        ctx.font = '30px Arial'; // Larger font for High Scores title
        ctx.fillText('High Scores:', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130);
        ctx.font = '20px Arial'; // Smaller font for individual scores
        highScores.forEach((hs, index) => {
            ctx.fillText(`${index + 1}. ${hs.score} - ${hs.date}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 160 + index * 30);
        });

    } else if (currentState === GAME_STATE.LOADOUT) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loadout', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);

        let yOffset = GAME_HEIGHT / 2 - 30;
        for (const gunKey in GUNS) {
            const gun = GUNS[gunKey];
            ctx.font = '25px Arial';
            ctx.fillText(`${gun.name} (Dmg: ${gun.damage}, Ammo: ${gun.ammoCapacity}, Rld: ${gun.reloadTime / 1000}s)`, GAME_WIDTH / 2, yOffset);
            if (currentGun === gun) {
                ctx.fillText(' (EQUIPPED)', GAME_WIDTH / 2 + ctx.measureText(`${gun.name} (Dmg: ${gun.damage}, Ammo: ${gun.ammoCapacity}, Rld: ${gun.reloadTime / 1000}s)`).width / 2 + 10, yOffset); // Adjust position for "EQUIPPED"
            }
            yOffset += 40;
        }

        ctx.font = '20px Arial';
        ctx.fillText('Press 1 for Shotgun, 2 for Rifle, 3 for Sniper Rifle', GAME_WIDTH / 2, yOffset + 30);
        ctx.fillText('Press Enter to Start Game', GAME_WIDTH / 2, yOffset + 60);
        ctx.fillText('Press M for Main Menu', GAME_WIDTH / 2, yOffset + 90);
    }
}

function update(deltaTime) {
    if (currentState === GAME_STATE.RUNNING) {
        gameTime -= deltaTime / 1000;

        // Update shot animation alpha
        if (shotFired) {
            shotAlpha -= deltaTime / 200; // Fade out over 200ms
            if (shotAlpha <= 0) {
                shotFired = false;
                shotAlpha = 0;
            }
        }

        // Update reloading timer
        if (reloading) {
            reloadTimer -= deltaTime;
            if (reloadTimer <= 0) {
                ammo = MAX_AMMO;
                reloading = false;
            }
        }

        // Update score pop-ups
        scorePopups.forEach((popup, index) => {
            popup.y -= deltaTime * 0.1; // Move up
            popup.alpha -= deltaTime / 1000; // Fade out over 1 second
            popup.fontSize += deltaTime * 0.01; // Grow slightly
            if (popup.alpha <= 0) {
                scorePopups.splice(index, 1); // Remove if fully faded
            }
        });

        if (gameTime <= 0) {
            currentState = GAME_STATE.GAMEOVER;
            gameTime = 0;
            saveHighScore(score); // Save score when game ends
        }

        // Update animals
        animals = animals.filter(animal => !animal.update(deltaTime)); // Remove fleeing animals that go off-screen

        // Spawn new animals
        if (performance.now() - lastAnimalSpawnTime > ANIMAL_SPAWN_INTERVAL) {
            spawnAnimal();
            lastAnimalSpawnTime = performance.now();
        }
    }
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

// Event Listeners
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

canvas.addEventListener('click', (event) => {
    // mouseX and mouseY are already updated by mousemove
    if (currentState === GAME_STATE.MENU) {
        currentState = GAME_STATE.RUNNING;
        score = 0;
        gameTime = 60;
        animals = [];
        lastAnimalSpawnTime = performance.now();
        currentGun = GUNS.SHOTGUN; // Reset gun to default on new game
        ammo = currentGun.ammoCapacity; // Reset ammo based on current gun
        reloading = false;
        reloadTimer = 0;
        pelts = 0; // Reset pelts on new game
    } else if (currentState === GAME_STATE.RUNNING) {
        if (ammo > 0 && !reloading) {
            ammo--; // Consume one ammo

            // Handle multiple pellets for shotgun
            const numPellets = currentGun.pellets;
            const spreadAngle = currentGun.spread;

            for (let p = 0; p < numPellets; p++) {
                // Calculate a random offset for each pellet within the spread
                const angleOffset = (Math.random() - 0.5) * spreadAngle * 2;
                const adjustedMouseX = mouseX + Math.cos(angleOffset) * 50; // Adjust target slightly
                const adjustedMouseY = mouseY + Math.sin(angleOffset) * 50;

                // Trigger shot animation for each pellet (optional, might be too many)
                // For now, just one visual shot feedback
                if (p === 0) {
                    shotFired = true;
                    shotX = mouseX;
                    shotY = mouseY;
                    shotAlpha = 1;
                }

                let hit = false;
                for (let i = animals.length - 1; i >= 0; i--) {
                    if (animals[i].hiding) {
                        continue;
                    }

                if (animals[i].isClicked(adjustedMouseX, adjustedMouseY)) {
                    score += animals[i].points * currentGun.damage; // Apply gun damage multiplier
                    pelts++; // Increment pelts on successful hit
                    scorePopups.push({
                        points: animals[i].points * currentGun.damage,
                        x: animals[i].x,
                        y: animals[i].y,
                        alpha: 1,
                        fontSize: 14
                    });

                        const hitAnimal = animals[i];
                        hitAnimal.originalColor = hitAnimal.getColor();
                        hitAnimal.getColor = () => 'red';
                        setTimeout(() => {
                            animals.splice(i, 1);
                        }, 100);
                        hit = true;
                        break; // Only hit one animal per pellet
                    } else {
                        const distance = Math.sqrt(
                            (adjustedMouseX - animals[i].x) * (adjustedMouseX - animals[i].x) +
                            (adjustedMouseY - animals[i].y) * (adjustedMouseY - animals[i].y)
                        );
                        if (distance < animals[i].size * 2) {
                            animals[i].fleeing = true;
                        }
                    }
                }
                if (!hit && numPellets === 1) { // Only penalize for a miss if it's a single shot (rifle)
                    score -= 10;
                    if (score < 0) score = 0;
                    scorePopups.push({
                        points: -10,
                        x: mouseX,
                        y: mouseY,
                        alpha: 1,
                        fontSize: 14,
                        color: 'red'
                    });
                }
            }
        } else if (ammo === 0 && !reloading) {
            reloading = true;
            reloadTimer = currentGun.reloadTime;
        }
    } else if (currentState === GAME_STATE.GAMEOVER) {
        currentState = GAME_STATE.MENU;
    } else if (currentState === GAME_STATE.LOADOUT) {
        // In loadout, clicking does nothing for now, only keyboard input
    }
});

// Reload button variables
const RELOAD_BUTTON_WIDTH = 120;
const RELOAD_BUTTON_HEIGHT = 40;
const RELOAD_BUTTON_X = (GAME_WIDTH - RELOAD_BUTTON_WIDTH) / 2;
const RELOAD_BUTTON_Y = GAME_HEIGHT - RELOAD_BUTTON_HEIGHT - 20; // Position at bottom middle

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (currentState === GAME_STATE.RUNNING) {
        // Check if reload button was clicked
        if (clickX > RELOAD_BUTTON_X && clickX < RELOLOAD_BUTTON_X + RELOAD_BUTTON_WIDTH &&
            clickY > RELOAD_BUTTON_Y && clickY < RELOAD_BUTTON_Y + RELOAD_BUTTON_HEIGHT) {
            if (!reloading && ammo < currentGun.ammoCapacity) {
                reloading = true;
                reloadTimer = currentGun.reloadTime;
            }
        }
    }
});

// Keyboard event for manual reload (e.g., 'R' key)
document.addEventListener('keydown', (event) => {
    if (currentState === GAME_STATE.RUNNING && event.key.toLowerCase() === 'r' && !reloading && ammo < currentGun.ammoCapacity) {
        reloading = true;
        reloadTimer = currentGun.reloadTime;
    } else if (currentState === GAME_STATE.MENU && event.key.toLowerCase() === 'l') {
        currentState = GAME_STATE.LOADOUT;
    } else if (currentState === GAME_STATE.GAMEOVER && event.key.toLowerCase() === 'l') {
        currentState = GAME_STATE.LOADOUT;
    } else if (currentState === GAME_STATE.LOADOUT) {
        if (event.key === '1') {
            currentGun = GUNS.SHOTGUN;
            ammo = currentGun.ammoCapacity;
            reloading = false;
            reloadTimer = 0;
        } else if (event.key === '2') {
            currentGun = GUNS.RIFLE;
            ammo = currentGun.ammoCapacity;
            reloading = false;
            reloadTimer = 0;
        } else if (event.key === '3') { // New key for Sniper Rifle
            currentGun = GUNS.SNIPER;
            ammo = currentGun.ammoCapacity;
            reloading = false;
            reloadTimer = 0;
        } else if (event.key === 'Enter') {
            currentState = GAME_STATE.RUNNING;
            score = 0;
            pelts = 0; // Reset pelts on new game
            gameTime = 60;
            animals = [];
            lastAnimalSpawnTime = performance.now();
            ammo = currentGun.ammoCapacity; // Reset ammo based on selected gun
            reloading = false;
            reloadTimer = 0;
        } else if (event.key.toLowerCase() === 'm') {
            currentState = GAME_STATE.MENU;
        }
    }
});

// Initial load of high scores
loadHighScores();

// Start the game loop
requestAnimationFrame(gameLoop);

// Export functions for testing (if needed, though tests.js will directly access them)
// window.huntAnimal = huntAnimal;
// window.calculateScore = calculateScore;
