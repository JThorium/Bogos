import { ctx, gameState } from './game.js';

/**
 * Projects a 3D wireframe model onto the 2D canvas and draws it.
 * @param {object} model - The 3D model with vertices and edges.
 * @param {number} x - X coordinate for the model's center.
 * @param {number} y - Y coordinate for the model's center.
 * @param {number} size - Scaling factor for the model.
 * @param {object} angles - Rotation angles (x, y, z) for the model.
 * @param {string} color - Stroke color for the wireframe.
 * @param {number} lineWidth - Line width for the wireframe.
 */
export function projectAndDrawWireframe(model, x, y, size, angles, color, lineWidth) {
    if(!model || color === 'transparent') return;
    const projected = []; const { vertices, edges } = model;
    vertices.forEach(v => { let rotX = v.y * Math.cos(angles.x) - v.z * Math.sin(angles.x); let rotZ = v.y * Math.sin(angles.x) + v.z * Math.cos(angles.x); let rotY = v.x * Math.cos(angles.y) + rotZ * Math.sin(angles.y); rotZ = -v.x * Math.sin(angles.y) + rotZ * Math.cos(angles.y); let rotX2 = rotY * Math.cos(angles.z) - rotX * Math.sin(angles.z); let rotY2 = rotY * Math.sin(angles.z) + rotX * Math.cos(angles.z); projected.push({ x: rotX2 * size/20 + x, y: rotY2 * size/20 + y }); });
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.beginPath();
    edges.forEach(edge => { const p1 = projected[edge[0]]; const p2 = projected[edge[1]]; ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); });
    ctx.stroke();
}

export function createExplosion(x,y,color,count) { gameState.sfx.explosion.triggerAttackRelease(0.15); triggerScreenShake(count/4, 10); for (let i=0; i<count; i++) gameState.particles.push(new Particle(x,y,(Math.random()-0.5)*4,(Math.random()-0.5)*4,color,Math.random()*2+1,25)); }
export function addScore(amount) { gameState.score += amount * gameState.scoreMultiplier; checkUnlocks(); }
export function isColliding(a,b) { if(!a || !b) return false; const dx = a.x - b.x; const dy = a.y - b.y; return Math.hypot(dx, dy) < (a.size + b.size); }
export function triggerScreenShake(intensity, duration) { gameState.screenShake.intensity = Math.max(gameState.screenShake.intensity, intensity * 0.2); gameState.screenShake.duration = Math.max(gameState.screenShake.duration, duration); }
export function checkUnlocks() { let changed = false; for (const key in UFO_TYPES) { if(key === 'interceptor') continue; const ufo = UFO_TYPES[key]; if (ufo.unlockMethod === 'score' && gameState.score >= ufo.unlockScore && !gameState.unlockedUFOs.has(key)) { gameState.unlockedUFOs.add(key); gameState.sfx.unlock.triggerAttackRelease(['C5','E5','G5'],'4n'); changed = true; } } if(changed) localStorage.setItem('unlockedUFOs', JSON.stringify([...gameState.unlockedUFOs])); }


// Note: Particle and UFO_TYPES are imported here for createExplosion and checkUnlocks respectively.
// This creates a circular dependency if Particle/UFO_TYPES also import utils.
// A more advanced refactor might involve a central event bus or passing these as arguments.
// For now, this setup allows the game to run with modularized classes.