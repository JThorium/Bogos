// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

let score = 0;
let gameTime = 60; // seconds
let lastTime = 0;
let animals = [];
const ANIMAL_SPAWN_INTERVAL = 1000; // milliseconds (increased frequency)
let lastAnimalSpawnTime = 0;
let scorePopups = []; // Array to hold score pop-up objects

let ammo = 10;
const MAX_AMMO = 10;
const RELOAD_TIME = 1500; // milliseconds
let reloading = false;
let reloadTimer = 0;

// Game State
const GAME_STATE = {
    MENU: 0,
    RUNNING: 1,
    GAMEOVER: 2
};
let currentState = GAME_STATE.MENU;

// Mouse and Shot variables for crosshair and shooting animation
let mouseX = 0;
let mouseY = 0;
let shotFired = false;
let shotX = 0;
let shotY = 0;
let shotAlpha = 0;

// Animal Class
class Animal {
    constructor(type, x, y, size, speed, points) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.points = points;
        this.direction = Math.random() < 0.5 ? 1 : -1; // 1 for right, -1 for left
        this.fleeing = false;
    }

    draw() {
        ctx.fillStyle = this.getColor();
        ctx.save(); // Save the current canvas state
        ctx.translate(this.x, this.y); // Move origin to animal's center

        switch (this.type.toLowerCase()) {
            case "deer":
                // Draw a simple rectangle for deer
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
            case "rabbit":
                // Draw a circle for rabbit
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case "bear":
                // Draw a simple triangle for bear
                ctx.beginPath();
                ctx.moveTo(0, -this.size / 2);
                ctx.lineTo(-this.size / 2, this.size / 2);
                ctx.lineTo(this.size / 2, this.size / 2);
                ctx.closePath();
                ctx.fill();
                break;
            default:
                // Default to circle
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
        if (this.fleeing) {
            // Fleeing animals move faster and away from the center of the canvas
            const centerX = GAME_WIDTH / 2;
            const centerY = GAME_HEIGHT / 2;
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const angle = Math.atan2(dy, dx);

            this.x += Math.cos(angle) * this.speed * 2 * (deltaTime / 1000); // Move away from center
            this.y += Math.sin(angle) * this.speed * 2 * (deltaTime / 1000);

            // If fleeing animal goes off-screen, remove it
            if (this.x < -this.size || this.x > GAME_WIDTH + this.size ||
                this.y < -this.size || this.y > GAME_HEIGHT + this.size) {
                return true; // Indicate that this animal should be removed
            }
        } else {
            this.x += this.speed * this.direction * (deltaTime / 1000); // Move horizontally

            // Bounce off walls
            if (this.x - this.size / 2 < 0 || this.x + this.size / 2 > GAME_WIDTH) {
                this.direction *= -1;
            }
        }
        return false; // Indicate that this animal should not be removed
    }

    getColor() {
        switch (this.type.toLowerCase()) {
            case "deer": return "brown";
            case "rabbit": return "grey";
            case "bear": return "black";
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
    const animalTypes = ["deer", "rabbit", "bear"];
    const randomType = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    const size = 40; // Increased size
    const x = Math.random() * (GAME_WIDTH - size) + size / 2;
    const y = Math.random() * (GAME_HEIGHT - size) + size / 2;
    const speed = 30 + Math.random() * 70; // 30 to 100 pixels per second (slower)
    let points;

    switch (randomType) {
        case "deer": points = 100; break;
        case "rabbit": points = 50; break;
        case "bear": points = 200; break;
    }

    animals.push(new Animal(randomType, x, y, size, speed, points));
}

function draw() {
    // Draw background (sky)
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.fillRect(0, GAME_HEIGHT * 0.7, GAME_WIDTH, GAME_HEIGHT * 0.3); // Ground covers bottom 30%

    if (currentState === GAME_STATE.MENU) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Hunting Game', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText('Click to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    } else if (currentState === GAME_STATE.RUNNING) {
        // Draw animals
        animals.forEach(animal => animal.draw());

        // Draw score and timer
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.textAlign = 'right';
        ctx.fillText(`Time: ${Math.max(0, Math.floor(gameTime))}`, GAME_WIDTH - 10, 30);

        // Draw ammo
        ctx.textAlign = 'center';
        ctx.fillText(`Ammo: ${ammo}/${MAX_AMMO}`, GAME_WIDTH / 2, 30);
        if (reloading) {
            ctx.fillStyle = 'orange';
            ctx.fillText(`Reloading... ${(reloadTimer / 1000).toFixed(1)}s`, GAME_WIDTH / 2, 60);
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
    } else if (currentState === GAME_STATE.GAMEOVER) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
        ctx.font = '30px Arial';
        ctx.fillText(`Final Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
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
        ammo = MAX_AMMO; // Reset ammo on new game
        reloading = false;
        reloadTimer = 0;
    } else if (currentState === GAME_STATE.RUNNING) {
        if (ammo > 0 && !reloading) {
            ammo--; // Consume one ammo

            // Trigger shot animation
            shotFired = true;
            shotX = mouseX;
            shotY = mouseY;
            shotAlpha = 1; // Start fully opaque

            let hit = false;
            for (let i = animals.length - 1; i >= 0; i--) {
                if (animals[i].isClicked(mouseX, mouseY)) {
                    score += animals[i].points;
                    // Add score pop-up
                    scorePopups.push({
                        points: animals[i].points,
                        x: animals[i].x,
                        y: animals[i].y,
                        alpha: 1,
                        fontSize: 14
                    });

                    // For visual feedback, briefly change color before removing
                    const hitAnimal = animals[i];
                    hitAnimal.originalColor = hitAnimal.getColor(); // Store original color
                    hitAnimal.getColor = () => 'red'; // Change to red on hit
                    setTimeout(() => {
                        animals.splice(i, 1); // Remove after a short delay
                    }, 100); // 100ms delay for visual feedback
                    hit = true;
                    break; // Only hit one animal per click
                } else {
                    // Check for near-miss to trigger fleeing behavior
                    const distance = Math.sqrt(
                        (mouseX - animals[i].x) * (mouseX - animals[i].x) +
                        (mouseY - animals[i].y) * (mouseY - animals[i].y)
                    );
                    if (distance < animals[i].size * 2) { // If click is within 2x animal size
                        animals[i].fleeing = true;
                    }
                }
            }

            if (!hit) {
                score -= 10; // Penalty for missing
                if (score < 0) score = 0; // Prevent negative score
                scorePopups.push({
                    points: -10, // Negative points for miss
                    x: mouseX,
                    y: mouseY,
                    alpha: 1,
                    fontSize: 14,
                    color: 'red' // Indicate penalty
                });
            }
        } else if (ammo === 0 && !reloading) {
            // Auto-reload if out of ammo
            reloading = true;
            reloadTimer = RELOAD_TIME;
        }
    } else if (currentState === GAME_STATE.GAMEOVER) {
        currentState = GAME_STATE.MENU; // Go back to menu to restart
    }
});

// Keyboard event for manual reload (e.g., 'R' key)
document.addEventListener('keydown', (event) => {
    if (currentState === GAME_STATE.RUNNING && event.key.toLowerCase() === 'r' && !reloading && ammo < MAX_AMMO) {
        reloading = true;
        reloadTimer = RELOAD_TIME;
    }
});

// Start the game loop
requestAnimationFrame(gameLoop);

// Export functions for testing (if needed, though tests.js will directly access them)
// window.huntAnimal = huntAnimal;
// window.calculateScore = calculateScore;
