# Astro Annihilator Reborn - Gameplay Logic Porting Plan

This document outlines the structured plan to port the gameplay logic from `AstroAnnihilator/OriginalDONTCHANGE/AstroAnnihilatorAlpha6.html` to the React Three Fiber (R3F) project `AstroAnnihilatorReborn/`. The goal is to replicate the original game's mechanics, including player abilities, diverse enemy behaviors, detailed collision detection, powerup interactions, and wave management, within the R3F architecture, **with solid 3D models instead of wireframes, ensuring optimal performance and broad compatibility.**

**Current Status:**
*   Vite server configuration updated.
*   `getUfoDimensions` helper function exported from `PlayerShip.jsx` and imported into `GameScene.jsx`.
*   Basic enemy movement in `GameScene.jsx` updated to be frame-rate independent.
*   Collision bounding box sizing in `GameScene.jsx` updated to use `getUfoDimensions`.

---

## Phase 1: Data and Core Entity Alignment

**Objective:** Integrate the detailed game data (UFO types, enemy models, abilities) from the HTML version into the R3F project's data structures, ensuring proper 3D model representation and considering performance implications.

### Step 1.1: Update `UFOData.js` with Comprehensive UFO/Enemy Data

*   **Objective:** Transfer all `UFO_TYPES` and `ENEMY_MODELS` definitions from `AstroAnnihilatorAlpha6.html` into `AstroAnnihilatorReborn/src/game/UFOData.js`. This includes stats, abilities, unlock methods, and visual properties.
*   **Files Involved:**
    *   `AstroAnnihilatorReborn/src/game/UFOData.js` (Modify)
    *   `AstroAnnihilator/OriginalDONTCHANGE/AstroAnnihilatorAlpha6.html` (Reference)
*   **Details:**
    *   For each UFO type in `UFO_TYPES`, add `stats` (health, damage, shotCooldown) and `ability` descriptions.
    *   Define `ENEMY_MODELS` with their `geometry` (e.g., `BoxGeometry`, `SphereGeometry`), `colors`, and `stats` (size, speed, health, shootCooldown, etc.).
    *   Ensure `geometry` definitions are compatible with R3F (e.g., `type: 'BoxGeometry', args: [width, height, depth]`).
    *   Add `ASTEROID_MODEL` and `BOSS_MODEL_1`, `BOSS_MODEL_2` definitions.
*   **Verification:** Read `UFOData.js` to confirm all data is correctly integrated.

### Step 1.2: Modify `GameEntity.jsx` for Solid 3D Rendering

*   **Objective:** Change the base `GameEntity` component to render solid 3D objects instead of wireframes, using `meshStandardMaterial` for proper lighting and color. This is crucial for visual fidelity and performance.
*   **Files Involved:**
    *   `AstroAnnihilatorReborn/src/game/entities/GameEntity.jsx` (Modify)
*   **Details:**
    *   Replace `meshBasicMaterial` with `meshStandardMaterial`.
    *   Remove the `wireframe` property from the material.
    *   Ensure the `color` prop is correctly applied to the material.
    *   **Performance Consideration:** For simple geometries, `meshStandardMaterial` is generally efficient. If complex models are introduced later, further optimization (e.g., instancing, LOD) might be needed, but for now, this change is sufficient.
*   **Verification:** Visually confirm entities are rendered as solid objects.

---

## Phase 2: Core Game Logic Refactoring

**Objective:** Port the main game loop logic, entity updates, and collision handling from the HTML version to `GameScene.jsx` and related R3F components, with a strong emphasis on performance and smooth execution.

### Step 2.1: Refactor `GameScene.jsx` for Comprehensive Entity Management

*   **Objective:** Implement the full game loop logic, including player, enemy, bullet, powerup, and obstacle updates, as well as advanced collision detection, ensuring frame-rate independence and minimizing performance overhead.
*   **Files Involved:**
    *   `AstroAnnihilatorReborn/src/game/GameScene.jsx` (Modify)
    *   `AstroAnnihilatorReborn/src/game/GameProvider.jsx` (Modify)
    *   `AstroAnnihilatorReborn/src/game/entities/PlayerShip.jsx` (Modify)
    *   `AstroAnnihilator/OriginalDONTCHANGE/AstroAnnihilatorAlpha6.html` (Reference)
*   **Details:**
    *   **Player Controls (NEW):**
        *   **PC:**
            *   Mouse movement: Player UFO follows the mouse pointer 1:1.
            *   Hold Left Click: Use UFO ability.
            *   Double Click: Use a bomb.
            *   Right Click: Open the in-game Hangar (shop).
        *   **Mobile:**
            *   Dragging: Controls player movement.
            *   Two fingers (tracking point between them): Activates the ability.
            *   Double tap with two fingers: Uses the bomb.
            *   Triple double tap with three fingers: Opens the in-game Hangar.
        *   This will require updating event listeners and input handling in `GameScene.jsx` and `PlayerShip.jsx`.
    *   **Player State & Abilities:**
        *   Move player-specific state (health, shield, bombs, abilities, `ghostTimer`, `spectreTimer`, `reaperBoost`, `phoenixUsed`, `abilityState`) from HTML's global variables/Player class to `GameProvider.jsx`'s `gameState` or `GameScene.jsx`'s local state, making them reactive.
        *   Adapt `player.update()` logic to `useFrame` in `PlayerShip.jsx` or `GameScene.jsx`, including movement, autofire, and ability handling.
        *   Implement `handleAbility()`, `releaseAbility()`, `updateAbility()`, and `drawAbility()` logic within `GameScene.jsx` or dedicated R3F components/hooks. This will involve creating new R3F components for visual effects of abilities (e.g., Paladin's laser, Vortex's singularity, Chronomancer's field).
    *   **Enemy Movement & Spawning:**
        *   Refine enemy movement in `GameScene.jsx`'s `useFrame` loop using `delta` for frame-rate independence and implementing specific movement patterns from `Enemy` class (e.g., `speedX` changes, `Math.sin` for weaver, dodging for dodger, homing for kamikaze, orbiter's targetY).
        *   Port `WaveManager` logic to `GameScene.jsx` to control enemy spawning frequency, types based on score, and boss spawning.
        *   Ensure new enemies are added to the `enemies` state array correctly.
    *   **Collision Detection:**
        *   Thoroughly review and correct all collision checks (`_enemyBox.intersectsBox(_bulletBox)`, `playerBoundingBox.intersectsBox(_enemyBox)`, etc.) in `GameScene.jsx`.
        *   Ensure `getUfoDimensions` is used consistently for all entities (player, enemies, bullets, powerups, obstacles) when setting up `Box3` for accurate collision volumes.
        *   Implement `isColliding` logic for all entity types (bullets vs. targets, player vs. enemies/obstacles/powerups).
        *   **Performance Consideration:** Use `Box3` and `Vector3` objects efficiently by reusing them (`_vector3`, `_playerBox`, etc.) to minimize garbage collection.
    *   **Bullet Logic:**
        *   Implement `HomingBullet` behavior within `GameScene.jsx`'s bullet update loop, including target finding and turning.
        *   Ensure `Bullet` properties like `canSlow` are correctly handled.
        *   **Performance Consideration:** Ensure bullet filtering (out-of-bounds) is efficient. If bullet count becomes extremely high, consider object pooling.
    *   **Powerups & Obstacles:**
        *   Create new R3F components for `PowerUp` (shield, minion, ghost, bomb) and `RawMaterialPickup`.
        *   Create new R3F components for `Obstacle` (asteroid, blackhole).
        *   Implement their update logic (movement, lifespan, blackhole gravity) and collision effects in `GameScene.jsx`.
    *   **Particles & Explosions:** Adapt `createExplosion` and `Particle` logic to R3F.
        *   **Performance Consideration:** For large numbers of particles, consider using R3F's `instancedMesh` or a custom particle system that renders many particles with a single draw call to avoid performance bottlenecks.
    *   **Screen Shake:** Implement screen shake effect in `GameScene.jsx` using camera adjustments.
*   **Verification:** (To be performed by the user)
    *   Observe enemy movement patterns.
    *   Test player shooting and verify bullet behavior (speed, homing).
    *   Confirm collisions between player/enemies/bullets/powerups/obstacles are accurate.
    *   Check if powerups are collected and apply their effects.
    *   Verify enemy spawning rates and types change with score.
    *   Ensure performance is acceptable (no freezing).

### Step 2.2: Refactor `EnemyShip.jsx` for Advanced Behavior

*   **Objective:** Implement the detailed update logic for each enemy type within `EnemyShip.jsx` to control their movement, rotation, and shooting patterns.
*   **Files Involved:**
    *   `AstroAnnihilatorReborn/src/game/entities/EnemyShip.jsx` (Modify)
    *   `AstroAnnihilator/OriginalDONTCHANGE/AstroAnnihilatorAlpha6.html` (Reference)
*   **Details:**
    *   Integrate the `update()` method logic from the HTML `Enemy` class into `EnemyShip.jsx`'s `useFrame` hook.
    *   Ensure `speedMod` for slowing effects is applied.
    *   Implement type-specific movement (e.g., `grunt` bouncing, `weaver` sine wave, `dodger` evasion, `orbiter` targeting, `kamikaze` homing, `stealth` transparency).
    *   Implement type-specific shooting patterns and cooldowns.
    *   Ensure `takeDamage()` and `onDeath()` (e.g., splitter spawning new enemies) are correctly handled.
*   **Verification:** (To be performed by the user)
    *   Observe individual enemy behaviors in-game.

---

## Phase 3: UI and Game State Integration

**Objective:** Connect the R3F game state to the UI components and ensure all persistent data (upgrades, unlocks) are correctly managed.

### Step 3.1: Update `GameProvider.jsx` and UI Components

*   **Objective:** Centralize game state management and ensure UI elements reflect the game's status.
*   **Files Involved:**
    *   `AstroAnnihilatorReborn/src/game/GameProvider.jsx` (Modify)
    *   `AstroAnnihilatorReborn/src/App.jsx` (Modify)
    *   `AstroAnnihilatorReborn/src/ui/*.jsx` (Modify as needed)
    *   `AstroAnnihilator/OriginalDONTCHANGE/AstroAnnihilatorAlpha6.html` (Reference)
*   **Details:**
    *   **`GameProvider.jsx`:** Expand the `gameState` to include all necessary variables from the HTML version (score, highScore, starCredits, rawMaterials, materialsThisRun, hasPurchasedScoreBoost, spawnMultiplier, `isPaused`, `isGameOver`, `gameFrame`, `waveCount`, `waveCredits`, `bombPurchaseCost`, `healthPurchaseCost`, `shieldPurchaseCost`, `mouse`, `currentBoss`, `scoreMultiplier`, `ghostTimer`, `spectreTimer`, `isAbilityHeld`, `screenShake`, `uiState`, `gameMode`, `fusionConfig`, `isCombineAllActive`, `shopCosts`, `musicInitialized`, `titleClickCount`, `upgrades`, `unlockedUFOs`).
    *   **UI Components:** Update `MainMenu.jsx`, `HangarScreen.jsx`, `GameOverScreen.jsx`, `PauseMenu.jsx`, etc., to read from and update the `gameState` provided by `GameProvider`. This will involve replacing direct DOM manipulations (`document.getElementById`) with React state and props.
    *   **Local Storage:** Ensure all persistent data (highScore, starCredits, rawMaterials, upgrades, unlockedUFOs, fusionConfig, gameMode, isCombineAllActive, selectedUFO, hasPurchasedScoreBoost, spawnMultiplier) are correctly loaded from and saved to `localStorage`.
    *   **Audio:** Integrate Tone.js audio initialization and playback (`initAudio`, `startMusic`, `stopMusic`) into the R3F lifecycle, likely within `GameProvider.jsx` or a dedicated audio hook.
*   **Verification:** (To be performed by the user)
    *   All UI elements display correct game state.
    *   Menus (pause, hangar, game over) function as expected.
    *   Progress (score, credits, unlocks) persists across sessions.
    *   Audio plays correctly.

---

## Phase 4: Final Review and Testing

**Objective:** Conduct a comprehensive review and testing phase to ensure all ported logic functions correctly and efficiently.

### Step 4.1: Comprehensive Testing

*   **Objective:** Play through the game extensively, testing all mechanics, abilities, enemy types, and UI interactions.
*   **Files Involved:** All modified files.
*   **Details:**
    *   Verify all player abilities work as described.
    *   Confirm all enemy types exhibit their unique behaviors.
    *   Test all collision scenarios.
    *   Check powerup and obstacle interactions.
    *   Monitor performance for any regressions.
    *   Ensure all UI elements update correctly.
    *   Test game over, pause, and menu navigation.
*   **Verification:** The game runs smoothly, all features from the HTML version are present and functional in the R3F version, and no new bugs are introduced.

---

**Important Considerations Throughout the Process:**

*   **Modularity:** Break down complex logic into smaller, reusable R3F components or hooks where appropriate.
*   **Performance:** Continuously monitor performance, especially in `useFrame` loops, and optimize where necessary (e.g., object pooling, instancing). I will prioritize efficient code and data structures to minimize memory usage and CPU cycles.
*   **Error Handling:** Implement robust error handling for unexpected scenarios.
*   **Visual Fidelity:** Ensure the 3D representations of entities accurately reflect their intended sizes and appearances for correct collision detection.

---

I will now proceed with Phase 1, Step 1.1.

Please toggle to Act mode when you are ready for me to begin implementing these changes.
