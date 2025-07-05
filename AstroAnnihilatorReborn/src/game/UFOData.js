// 2024-06-09T20:30Z: Added missing stats to ENEMY_MODELS, ASTEROID_MODEL, and BOSS_MODELs for gameplay parity with original.

export const ufos = [
  { id: 'interceptor', name: 'Interceptor', geometry: { type: 'CylinderGeometry', args: [0.2, 0.4, 0.1, 32] }, colors: [1, 0, 0, 0, 1, 0], pattern: 2, stats: { moveSpeed: 0.2, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'single', thrusterColor: 0x00ff00, unlocked: true, cost: 0, unlockMethod: 'default', ability: 'Hold for Rapid Fire burst.' },
  { id: 'destroyer', name: 'Destroyer', geometry: { type: 'SphereGeometry', args: [0.4, 32, 32] }, colors: [0.7, 0.7, 0.7, 0, 0, 1], pattern: 1, stats: { moveSpeed: 0.15, health: 2, shotCooldown: 0.25, superchargePower: 3, drones: 0, damage: 1 }, shoot: 'spread', thrusterColor: 0x0000ff, unlocked: false, cost: 0, unlockMethod: 'score', unlockScore: 5000, ability: 'Starts with 1 Minion. Hold for homing minion fire.' },
  { id: 'sentinel', name: 'Sentinel', geometry: { type: 'DodecahedronGeometry', args: [0.35] }, colors: [0.5, 0, 1, 1, 1, 0], pattern: 0, stats: { moveSpeed: 0.13, health: 3, shotCooldown: 0.25, superchargePower: 2, drones: 0, damage: 1 }, shoot: 'spread', thrusterColor: 0xff0000, unlocked: false, cost: 15000, unlockMethod: 'score', unlockScore: 15000, ability: 'Starts with +1 Shield. Hold to consume a shield for a defensive nova.' },
  { id: 'ghost', name: 'Ghost', geometry: { type: 'IcosahedronGeometry', args: [0.35] }, colors: [0, 1, 1, 1, 0, 1], pattern: 0, stats: { moveSpeed: 0.14, health: 3, shotCooldown: 0.25, superchargePower: 2, drones: 0, damage: 1 }, shoot: 'spiral', thrusterColor: 0xff00ff, unlocked: false, cost: 40000, unlockMethod: 'score', unlockScore: 30000, ability: 'Brief invincibility after hit. Hold to manually phase out.' },
  { id: 'warlock', name: 'Warlock', geometry: { type: 'ConeGeometry', args: [0.3, 0.5, 32] }, colors: [0.5, 0, 1, 1, 1, 0], pattern: 0, stats: { moveSpeed: 0.13, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'homing', thrusterColor: 0xffff00, unlocked: false, cost: 55000, unlockMethod: 'score', unlockScore: 50000, ability: 'Fires homing shots. Hold to charge a powerful homing missile swarm.' },
  { id: 'juggernaut', name: 'Juggernaut', geometry: { type: 'BoxGeometry', args: [0.45, 0.45, 0.45] }, colors: [0, 1, 1, 1, 0.8, 0], pattern: 0, stats: { moveSpeed: 0.1, health: 6, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'single', thrusterColor: 0xffd700, unlocked: false, cost: 30000, unlockMethod: 'score', unlockScore: 75000, ability: 'Starts with 6 HP. Hold for a brief, invincible ramming charge.' },
  { id: 'vortex', name: 'Vortex', geometry: { type: 'TorusGeometry', args: [0.3, 0.1, 16, 32] }, colors: [0.5, 0.5, 0.5, 1, 0, 0], pattern: 1, stats: { moveSpeed: 0.16, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'arc', thrusterColor: 0xff0000, unlocked: false, cost: 125000, unlockMethod: 'score', unlockScore: 100000, ability: 'Pulls in powerups. Hold to create a bullet-sucking singularity.' },
  { id: 'reaper', name: 'Reaper', geometry: { type: 'CylinderGeometry', args: [0.25, 0.45, 0.15, 32] }, colors: [1, 0, 1, 0, 1, 0], pattern: 2, stats: { moveSpeed: 0.15, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'single', thrusterColor: 0x00ff00, unlocked: false, cost: 150000, unlockMethod: 'score', unlockScore: 150000, ability: 'Hold to create a field that converts enemies and bullets into Raw Materials.' },
  { id: 'paladin', name: 'Paladin', geometry: { type: 'SphereGeometry', args: [0.4, 32, 32] }, colors: [1, 1, 0, 0, 0, 1], pattern: 0, stats: { moveSpeed: 0.12, health: 3, shotCooldown: 0.25, superchargePower: 2, drones: 0, damage: 1 }, shoot: 'burst', thrusterColor: 0x0000ff, unlocked: false, cost: 2500, unlockMethod: 'credits', ability: 'Absorbs shots to charge laser. Hold to fire continuous laser beam.' },
  { id: 'spectre', name: 'Spectre', geometry: { type: 'CylinderGeometry', args: [0.3, 0.3, 0.1, 6] }, colors: [0, 0, 1, 1, 0, 0], pattern: 1, stats: { moveSpeed: 0.16, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'burst', thrusterColor: 0xff0000, unlocked: false, cost: 4000, unlockMethod: 'credits', ability: 'Periodically intangible. Hold to charge a short-range teleport.' },
  { id: 'alchemist', name: 'Alchemist', geometry: { type: 'BoxGeometry', args: [0.4, 0.4, 0.4] }, colors: [0, 0, 0, 1, 0, 1], pattern: 2, stats: { moveSpeed: 0.12, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 1, damage: 1 }, shoot: 'single', thrusterColor: 0xff00ff, unlocked: false, cost: 5000, unlockMethod: 'credits', ability: 'Hold to transmute nearby bullets to credits & give kills a chance to drop powerups.' },
  { id: 'engineer', name: 'Engineer', geometry: { type: 'CylinderGeometry', args: [0.25, 0.5, 0.15, 32] }, colors: [0, 0.5, 0.5, 1, 0.5, 0], pattern: 1, stats: { moveSpeed: 0.18, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'single', thrusterColor: 0xffa500, unlocked: false, cost: 7500, unlockMethod: 'credits', ability: 'Hold to deploy a temporary, mobile Sentry that follows you.' },
  { id: 'chronomancer', name: 'Chronomancer', geometry: { type: 'SphereGeometry', args: [0.45, 32, 32] }, colors: [0, 1, 0, 0.5, 0, 1], pattern: 1, stats: { moveSpeed: 0.13, health: 3, shotCooldown: 0.25, superchargePower: 1, drones: 0, damage: 1 }, shoot: 'homing', thrusterColor: 0x800080, unlocked: false, cost: 10000, unlockMethod: 'credits', ability: 'Shots can slow enemies. Hold to create a large time-slowing field.' },
  { id: 'berserker', name: 'Berserker', geometry: { type: 'ConeGeometry', args: [0.35, 0.5, 32] }, colors: [1, 1, 0, 0.5, 0, 0.5], pattern: 1, stats: { moveSpeed: 0.14, health: 3, shotCooldown: 0.25, superchargePower: 2, drones: 0, damage: 1 }, shoot: 'explosive', thrusterColor: 0x800080, unlocked: false, cost: 6000, unlockMethod: 'credits', ability: 'Fire rate increases as health drops. Hold to sacrifice health for a massive damage boost.' },
  { id: 'phoenix', name: 'Phoenix', geometry: { type: 'TetrahedronGeometry', args: [0.4] }, colors: [1, 0.8, 0, 0, 1, 1], pattern: 0, stats: { moveSpeed: 0.15, health: 3, shotCooldown: 0.25, superchargePower: 2, drones: 0, damage: 1 }, shoot: 'burst', thrusterColor: 0x00ffff, unlocked: false, cost: 12000, unlockMethod: 'credits', ability: 'Revives once. Hold to consume revive for a screen-clearing nova, full heal, & invincibility.' },
  { id: 'omega', name: 'Omega', geometry: { type: 'SphereGeometry', args: [0.5, 32, 32] }, colors: [0.5, 0, 1, 1, 1, 0], pattern: 0, stats: { moveSpeed: 0.1, health: 6, shotCooldown: 0.25, superchargePower: 1, drones: 2, damage: 1 }, shoot: 'homing', thrusterColor: 0xffff00, unlocked: false, cost: 999999999999, unlockMethod: 'credits', ability: 'The ultimate form. All abilities, double health & fire rate. Hold to cycle abilities.' }
];

export const ENEMY_MODELS = {
  grunt: {
    geometry: { type: 'BoxGeometry', args: [0.8, 0.8, 0.8] },
    colors: [1, 0.44, 0.44, 0.5, 0.5, 0.5],
    stats: {
      size: 20,
      health: 1,
      speedY: 1.5, // avg of (1~2)
      speedX: 0,   // will randomize at spawn
      shootCooldown: 100, // avg of (50~150)
    },
  },
  tank: {
    geometry: { type: 'BoxGeometry', args: [1.2, 1.2, 1.2] },
    colors: [0.63, 0.63, 0.63, 0.8, 0.8, 0.8],
    stats: {
      size: 25,
      health: 5,
      speedY: 1,
      speedX: 0,
      shootCooldown: 180,
    },
  },
  dasher: {
    geometry: { type: 'ConeGeometry', args: [0.4, 0.8, 32] },
    colors: [0.98, 0.8, 0.08, 0.7, 0.7, 0.7],
    stats: {
      size: 15,
      health: 0.5,
      speedY: 5,
      speedX: 0,
      shootCooldown: 999,
    },
  },
  weaver: {
    geometry: { type: 'CylinderGeometry', args: [0.3, 0.3, 0.6, 32] },
    colors: [0.65, 0.55, 0.98, 0.4, 0.4, 0.4],
    stats: {
      size: 18,
      health: 1,
      speedY: 2,
      speedX: 5,
      shootCooldown: 120,
    },
  },
  dodger: {
    geometry: { type: 'SphereGeometry', args: [0.5, 32, 32] },
    colors: [0.43, 0.91, 0.72, 0.6, 0.6, 0.6],
    stats: {
      size: 18,
      health: 2,
      speedY: 1.5,
      speedX: 0,
      shootCooldown: 200,
    },
  },
  orbiter: {
    geometry: { type: 'TorusGeometry', args: [0.4, 0.15, 16, 32] },
    colors: [0.98, 0.57, 0.24, 0.7, 0.7, 0.7],
    stats: {
      size: 22,
      health: 3,
      speedY: 2,
      speedX: 0,
      shootCooldown: 30,
      targetY: 150, // avg value, randomize at spawn
    },
  },
  kamikaze: {
    geometry: { type: 'TetrahedronGeometry', args: [0.5] },
    colors: [0.98, 0.65, 0.65, 0.5, 0.5, 0.5],
    stats: {
      size: 20,
      health: 1,
      speedY: 2,
      speedX: 0,
      shootCooldown: 999,
    },
  },
  sniper: {
    geometry: { type: 'CylinderGeometry', args: [0.2, 0.2, 1.0, 32] },
    colors: [0.5, 0.55, 0.98, 0.4, 0.4, 0.4],
    stats: {
      size: 15,
      health: 2,
      speedY: 1,
      speedX: 0, // will randomize at spawn
      shootCooldown: 150,
    },
  },
  splitter: {
    geometry: { type: 'BoxGeometry', args: [1.0, 1.0, 1.0] },
    colors: [0.96, 0.45, 0.71, 0.6, 0.6, 0.6],
    stats: {
      size: 25,
      health: 4,
      speedY: 1,
      speedX: 0,
      shootCooldown: 200,
    },
  },
  stealth: {
    geometry: { type: 'IcosahedronGeometry', args: [0.4] },
    colors: [0.58, 0.64, 0.72, 0.3, 0.3, 0.3],
    stats: {
      size: 16,
      health: 2,
      speedY: 1.5,
      speedX: 0, // will randomize at spawn
      shootCooldown: 100,
    },
  },
};

export const ASTEROID_MODEL = {
  geometry: { type: 'SphereGeometry', args: [0.7, 16, 16] },
  colors: [0.6, 0.6, 0.6, 0.4, 0.4, 0.4],
  stats: {
    size: 25, // avg of (15~35)
    health: 2.5, // avg size/10
    speedY: 1, // avg of (0.5~1.5)
  },
};

export const BOSS_MODEL_1 = {
  name: 'BEHEMOTH',
  geometry: { type: 'DodecahedronGeometry', args: [1.5] },
  colors: [0.93, 0.28, 0.6, 0.7, 0.7, 0.7],
  stats: {
    size: 60,
    health: 80, // base, scale in logic
    speedX: 2,
    shootCooldown: 50, // or 30 if health < maxHealth/2
  },
};
export const BOSS_MODEL_2 = {
  name: 'COLOSSUS',
  geometry: { type: 'IcosahedronGeometry', args: [1.8] },
  colors: [0.2, 0.8, 0.9, 0.5, 0.5, 0.5],
  stats: {
    size: 60,
    health: 80, // base, scale in logic
    speedX: 2,
    shootCooldown: 50,
  },
};
