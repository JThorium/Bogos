import { gameState, particles } from './game.js';
import { UFO_TYPES } from './gameData.js';
import { Particle } from './entities.js';

export function createExplosion(x,y,color,count) { gameState.sfx.explosion.triggerAttackRelease(0.15); triggerScreenShake(count/4, 10); for (let i=0; i<count; i++) gameState.particles.push(new Particle(x,y,(Math.random()-0.5)*4,(Math.random()-0.5)*4,color,Math.random()*2+1,25)); }
export function addScore(amount) { gameState.score += amount * gameState.scoreMultiplier; checkUnlocks(); }
export function isColliding(a,b) { if(!a || !b) return false; const dx = a.x - b.x; const dy = a.y - b.y; return Math.hypot(dx, dy) < (a.size + b.size); }
export function triggerScreenShake(intensity, duration) { gameState.screenShake.intensity = Math.max(gameState.screenShake.intensity, intensity * 0.2); gameState.screenShake.duration = Math.max(gameState.screenShake.duration, duration); }
export function checkUnlocks() { let changed = false; for (const key in UFO_TYPES) { if(key === 'interceptor') continue; const ufo = UFO_TYPES[key]; if (ufo.unlockMethod === 'score' && gameState.score >= ufo.unlockScore && !gameState.unlockedUFOs.has(key)) { gameState.unlockedUFOs.add(key); gameState.sfx.unlock.triggerAttackRelease(['C5','E5','G5'],'4n'); changed = true; } } if(changed) localStorage.setItem('unlockedUFOs', JSON.stringify([...gameState.unlockedUFOs])); }
