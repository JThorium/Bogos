export const UFO_TYPES = {
  interceptor: {
    id: 'interceptor',
    name: 'Interceptor',
    geometry: { type: 'CylinderBufferGeometry', args: [0.2, 0.4, 0.1, 7] },
    color: '#34d399',
    stats: {
      health: 3,
      fireRate: 10, // Lower is faster cooldown
      shield: 0,
      startBombs: 0,
      moveSpeed: 0.2,
      damage: 1,
      abilityParams: {
        rapidFireRateDivisor: 3, // Player fireRate gets divided by this
      }
    },
    abilityDesc: 'Hold for Rapid Fire burst.',
    unlockMethod: 'default',
    unlocked: true,
  },
  destroyer: {
    id: 'destroyer',
    name: 'Destroyer',
    geometry: { type: 'SphereBufferGeometry', args: [0.4, 16, 16] },
    color: '#f59e0b',
    stats: {
      health: 3,
      fireRate: 8,
      shield: 0,
      startBombs: 0,
      minionsOnStart: 1,
      moveSpeed: 0.18,
      damage: 1,
      abilityParams: {
        // Minions shoot homing when active
      }
    },
    abilityDesc: 'Starts with 1 Minion. Hold for homing minion fire.',
    unlockMethod: 'score',
    unlockScore: 5000,
    unlocked: false,
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    geometry: { type: 'DodecahedronBufferGeometry', args: [0.35, 0] },
    color: '#60a5fa',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 1,
      startBombs: 0,
      moveSpeed: 0.17,
      damage: 1,
      abilityParams: {
        novaExplosionParticles: 25,
        novaDurationFrames: 10,
      }
    },
    abilityDesc: 'Starts with +1 Shield. Hold to consume a shield for a defensive nova.',
    unlockMethod: 'score',
    unlockScore: 15000,
    unlocked: false,
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    geometry: { type: 'IcosahedronBufferGeometry', args: [0.35, 0] },
    color: '#f0f9ff', // Alpha6 uses a light/white color
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      moveSpeed: 0.19,
      damage: 1,
      ghostOnHitDurationFrames: 120,
      abilityParams: {
        manualPhaseDurationFrames: 120,
      }
    },
    abilityDesc: 'Brief invincibility after hit. Hold to manually phase out.',
    unlockMethod: 'score',
    unlockScore: 30000,
    unlocked: false,
  },
  warlock: {
    id: 'warlock',
    name: 'Warlock',
    geometry: { type: 'ConeBufferGeometry', args: [0.3, 0.5, 5] },
    color: '#c084fc',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      firesHomingShots: true, // Default attack is homing
      moveSpeed: 0.17,
      damage: 1, // Base shot damage
      abilityParams: {
        missileSwarmChargePerMissileFrames: 15,
        missileSwarmMaxMissiles: 10,
        missileDamage: 2, // Damage of swarm missiles
        missileHomingRange: 600, // from Alpha6 HomingBullet
      }
    },
    abilityDesc: 'Fires homing shots. Hold to charge a powerful homing missile swarm.',
    unlockMethod: 'score',
    unlockScore: 50000,
    unlocked: false,
  },
  juggernaut: {
    id: 'juggernaut',
    name: 'Juggernaut',
    geometry: { type: 'BoxBufferGeometry', args: [0.45, 0.45, 0.45] },
    color: '#fca5a5',
    stats: {
      health: 6,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      moveSpeed: 0.15, // Slower base
      damage: 1,
      abilityParams: {
        rammingChargeDurationFrames: 90,
        rammingSpeedMultiplier: 3, // Relative to its own base speed, or absolute factor for movement calc
        rammingBulletDamage: 2, // Side bullets during ram
      }
    },
    abilityDesc: 'Starts with 6 HP. Hold for a brief, invincible ramming charge.',
    unlockMethod: 'score',
    unlockScore: 75000,
    unlocked: false,
  },
  vortex: {
    id: 'vortex',
    name: 'Vortex',
    geometry: { type: 'TorusBufferGeometry', args: [0.3, 0.1, 8, 16] },
    color: '#2dd4bf',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      powerupPullRange: 100, // Alpha6 units, needs scaling
      powerupPullStrength: 2, // Alpha6 speed factor
      moveSpeed: 0.18,
      damage: 1,
      abilityParams: {
        singularityBulletPullRange: 150, // Alpha6 units
        singularityBulletPullStrength: 4, // Alpha6 speed factor
        singularityDurationFrames: 300,
        singularityAnnihilationRange: 20, // Alpha6 units
      }
    },
    abilityDesc: 'Pulls in powerups. Hold to create a bullet-sucking singularity.',
    unlockMethod: 'score',
    unlockScore: 100000,
    unlocked: false,
  },
  reaper: {
    id: 'reaper',
    name: 'Reaper',
    geometry: { type: 'CylinderBufferGeometry', args: [0.25, 0.45, 0.15, 7] },
    color: '#9ca3af',
    stats: {
      health: 3,
      fireRate: 9,
      shield: 0,
      startBombs: 0,
      reaperBoostOnKillDurationFrames: 120, // for +1 damage boost
      moveSpeed: 0.17,
      damage: 1, // Base damage, +1 with boost
      abilityParams: {
        conversionFieldRadius: 200, // Alpha6 units
        conversionFieldDurationFrames: 180,
      }
    },
    abilityDesc: 'Hold to create a field that converts enemies and bullets into Raw Materials.',
    unlockMethod: 'score',
    unlockScore: 150000,
    unlocked: false,
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    geometry: { type: 'SphereBufferGeometry', args: [0.38, 16, 16] },
    color: '#fde047',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      moveSpeed: 0.16,
      damage: 1, // Base shot damage
      abilityParams: {
        laserChargeMax: 10, // Hits to charge
        laserDamagePerTick: 0.5, // Damage per frame/tick of laser
        laserDurationFrames: 300,
      }
    },
    abilityDesc: 'Absorbs shots to charge laser. Hold to fire continuous laser beam.',
    unlockMethod: 'credits',
    cost: 2500,
    unlocked: false,
  },
  spectre: {
    id: 'spectre',
    name: 'Spectre',
    geometry: { type: 'CylinderBufferGeometry', args: [0.3, 0.3, 0.1, 6] },
    color: '#a5f3fc',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      intangiblePhaseDurationFrames: 120,
      intangibleTotalCycleFrames: 600,
      moveSpeed: 0.19,
      damage: 1,
      abilityParams: {
        teleportChargeTimeFrames: 60, // Example: 1 second charge
        teleportRange: 100, // Example: R3F units
      }
    },
    abilityDesc: 'Periodically intangible. Hold to charge a short-range teleport.',
    unlockMethod: 'credits',
    cost: 4000,
    unlocked: false,
  },
  alchemist: {
    id: 'alchemist',
    name: 'Alchemist',
    geometry: { type: 'BoxBufferGeometry', args: [0.4, 0.4, 0.4] },
    color: '#d946ef',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      moveSpeed: 0.16,
      damage: 1,
      abilityParams: {
        transmuteRange: 80, // Alpha6 units
        transmuteCreditsPerBullet: 1,
        powerupDropChanceOnKill: 0.2,
        transmuteDurationFrames: 300,
      }
    },
    abilityDesc: 'Hold to transmute nearby bullets to credits & give kills a chance to drop powerups.',
    unlockMethod: 'credits',
    cost: 5000,
    unlocked: false,
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    geometry: { type: 'CylinderBufferGeometry', args: [0.25, 0.5, 0.15, 7] },
    color: '#f97316',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      moveSpeed: 0.18,
      damage: 1,
      abilityParams: {
        sentryLifespanFrames: 300,
        sentryFireRate: 20, // Cooldown in frames for sentry
        sentryDamage: 1,
      }
    },
    abilityDesc: 'Hold to deploy a temporary, mobile Sentry that follows you.',
    unlockMethod: 'credits',
    cost: 7500,
    unlocked: false,
  },
  chronomancer: {
    id: 'chronomancer',
    name: 'Chronomancer',
    geometry: { type: 'SphereBufferGeometry', args: [0.45, 16, 16] },
    color: '#818cf8',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      shotSlowChance: 0.2,
      shotSlowDurationFrames: 180,
      moveSpeed: 0.17,
      damage: 1,
      abilityParams: {
        timeSlowFieldRadius: 200, // Alpha6 units
        timeSlowFactor: 0.2, // Multiplier for speed
      }
    },
    abilityDesc: 'Shots can slow enemies. Hold to create a large time-slowing field.',
    unlockMethod: 'credits',
    cost: 10000,
    unlocked: false,
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    geometry: { type: 'ConeBufferGeometry', args: [0.35, 0.5, 5] },
    color: '#ef4444',
    stats: {
      health: 3,
      fireRate: 10, // Base fireRate cooldown
      shield: 0,
      startBombs: 0,
      fireRateBonusPerLostHealth: 1, // Reduces fireRate cooldown by 1 for each HP lost
      moveSpeed: 0.18,
      damage: 1, // Base damage
      abilityParams: {
        healthSacrificeRateFrames: 30, // Sacrifices 1 HP every 30 frames
        activeDamageBoost: 2, // Adds +2 damage
        activeFireRateBoost: 5, // Further reduces fireRate cooldown by 5
        maxActiveDurationFrames: 180,
      }
    },
    abilityDesc: 'Fire rate increases as health drops. Hold to sacrifice health for a massive damage boost.',
    unlockMethod: 'credits',
    cost: 6000,
    unlocked: false,
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    geometry: { type: 'TetrahedronBufferGeometry', args: [0.4, 0] },
    color: '#fdba74',
    stats: {
      health: 3,
      fireRate: 10,
      shield: 0,
      startBombs: 0,
      reviveCount: 1,
      reviveToHealthFraction: 0.5,
      moveSpeed: 0.18,
      damage: 1,
      abilityParams: {
        novaExplosionDamage: 100,
        invincibilityPostNovaDurationFrames: 360,
      }
    },
    abilityDesc: 'Revives once. Hold to consume revive for a screen-clearing nova, full heal, & invincibility.',
    unlockMethod: 'credits',
    cost: 12000,
    unlocked: false,
  },
  omega: {
    id: 'omega',
    name: 'Omega',
    geometry: { type: 'SphereBufferGeometry', args: [0.5, 16, 16] },
    color: '#ffffff', // Special handling for rainbow color
    stats: {
      health: 6,
      fireRate: 5,
      shield: 1,
      startBombs: 1, // Example, can be tuned
      minionsOnStart: 1,
      moveSpeed: 0.2,
      damage: 2, // Example, slightly higher base damage
      abilityParams: {
        // Holds all other abilities; specific params would be referenced from source UFOs during gameplay
      }
    },
    abilityDesc: 'The ultimate form. All abilities, double health & fire rate. Hold to cycle abilities.',
    unlockMethod: 'credits',
    cost: 999999999999,
    unlocked: false,
  }
  // TODO: Add ~33 more UFOs from UFOsV2 list by June 2024.
  // For each, define: id, name, geometry (from UFOsV2, ensure type is XxxBufferGeometry),
  // color, stats (health, fireRate, shield, startBombs, moveSpeed, damage, abilityParams),
  // abilityDesc, unlockMethod ('score' or 'credits'), unlockScore/cost, unlocked (false).
  // Ability params should be invented or inspired by existing ones if not obvious.
};

export const ENEMY_TYPES = {
  grunt: {
    name: 'Grunt',
    geometry: { type: 'BoxBufferGeometry', args: [0.8, 0.8, 0.8] },
    color: '#f87171',
    stats: {
      size: 0.8, // Used for collision, visual scale might differ
      baseSpeed: 1 * 0.05, // Scaled for R3F units/frame, needs tuning
      speedXRandomFactor: 4 * 0.05,
      health: 1,
      shootCooldown: 100, // Average from Alpha6 (50-150 range)
      points: 100,
      bulletSpeed: 5 * 0.05,
      difficultySpeedScale: 1, // Factor to multiply baseSpeed by per difficulty level
      difficultyHealthScale: 1, // Factor to multiply health by per difficulty level
    }
  },
  tank: {
    name: 'Tank',
    geometry: { type: 'BoxBufferGeometry', args: [1.0, 1.0, 1.0] },
    color: '#a1a1aa',
    stats: {
      size: 1.0,
      baseSpeed: 1 * 0.05,
      speedXFactor: 0,
      health: 5,
      shootCooldown: 180,
      bulletPattern: 'tri-shot', // Shoots 3 bullets
      bulletDamage: 2,
      points: 150,
      bulletSpeed: 5 * 0.05,
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  },
  dasher: {
    name: 'Dasher',
    geometry: { type: 'ConeBufferGeometry', args: [0.4, 0.8, 5] },
    color: '#facc15',
    stats: {
      size: 0.6, // Approx from (0.4+0.8)/2
      baseSpeed: 5 * 0.05,
      speedXFactor: 0,
      health: 0.5,
      shootCooldown: 9999, // Doesn't shoot
      points: 120,
      isKamikaze: true, // Behavior flag
      difficultySpeedScale: 1,
      difficultyHealthScale: 0.5,
    }
  },
  weaver: {
    name: 'Weaver',
    geometry: { type: 'CylinderBufferGeometry', args: [0.3, 0.3, 0.6, 7] },
    color: '#a78bfa',
    stats: {
      size: 0.6, // Height
      baseSpeed: 2 * 0.05, // Vertical speed
      movementPattern: 'sine', // Behavior flag
      sineMovementAmplitude: 5 * 0.05, // Horizontal sine wave amplitude
      sineMovementFrequency: 0.1, // Controls speed of sine wave
      health: 1,
      shootCooldown: 120,
      points: 180,
      bulletSpeed: 5 * 0.05,
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  },
  dodger: {
    name: 'Dodger',
    geometry: { type: 'SphereBufferGeometry', args: [0.5, 16, 16] },
    color: '#6ee7b7',
    stats: {
      size: 0.5 * 2, // Diameter
      baseSpeed: 1.5 * 0.05,
      movementPattern: 'dodge', // Behavior flag
      dodgePlayerRange: 100 * 0.05, // Range to start dodging (scaled)
      dodgeSpeedFactor: 2 * 0.05, // Speed of dodge movement
      health: 2,
      shootCooldown: 200,
      points: 200,
      bulletSpeed: 5 * 0.05,
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  },
  orbiter: {
    name: 'Orbiter',
    geometry: { type: 'TorusBufferGeometry', args: [0.4, 0.15, 8, 16] },
    color: '#fb923c',
    stats: {
      size: (0.4 + 0.15) * 2, // Outer diameter
      baseSpeed: 2 * 0.05, // Speed to reach target Y
      targetYScreenFraction: 0.4, // Target Y as fraction of screen height from top (e.g. 0.4 = 40% down)
      orbitMovementAmplitude: 2 * 0.05, // Horizontal orbit speed/amplitude
      orbitMovementFrequency: 0.05,
      health: 3,
      shootCooldown: 30,
      bulletPattern: 'circular_4_way', // Shoots 4 bullets in circle when orbiting
      points: 250,
      bulletSpeed: 3 * 0.05,
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  },
  kamikaze: {
    name: 'Kamikaze',
    geometry: { type: 'TetrahedronBufferGeometry', args: [0.5, 0] },
    color: '#fca5a5',
    stats: {
      size: 0.5, // Approx radius
      baseSpeed: 2 * 0.05, // Homing speed towards player
      movementPattern: 'homing', // Behavior flag
      homingStrength: 1.0, // Factor for homing adjustment, tune
      health: 1,
      shootCooldown: 9999,
      points: 150,
      isKamikaze: true, // Collides with player
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  },
  sniper: {
    name: 'Sniper',
    geometry: { type: 'CylinderBufferGeometry', args: [0.2, 0.2, 1.0, 5] },
    color: '#818cf8',
    stats: {
      size: 1.0, // Height
      baseSpeed: 1 * 0.05,
      speedXRandomFactor: 2 * 0.05,
      health: 2,
      shootCooldown: 150,
      bulletSpeed: 8 * 0.05, // Fast bullet
      points: 220,
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  },
  splitter: {
    name: 'Splitter',
    geometry: { type: 'BoxBufferGeometry', args: [1.0, 1.0, 1.0] },
    color: '#f472b6',
    stats: {
      size: 1.0,
      baseSpeed: 1 * 0.05,
      speedXFactor: 0,
      health: 4,
      shootCooldown: 200,
      spawnOnDeathCount: 3,
      spawnOnDeathType: 'grunt',
      points: 300,
      bulletSpeed: 5 * 0.05,
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  },
  stealth: {
    name: 'Stealth',
    geometry: { type: 'IcosahedronBufferGeometry', args: [0.4, 0] },
    color: '#94a3b8',
    stats: {
      size: 0.4 * 2, // Diameter
      baseSpeed: 1.5 * 0.05,
      speedXRandomFactor: 1 * 0.05,
      health: 2,
      shootCooldown: 100,
      stealthPhaseParam: 0.1, // For Math.sin(this.phase * param) > 0 transparency
      points: 200,
      bulletSpeed: 5 * 0.05,
      difficultySpeedScale: 1,
      difficultyHealthScale: 1,
    }
  }
};

export const BOSS_TYPES = {
  goliath: {
    name: 'Goliath', // Alpha6 BOSS_MODEL_1
    geometry: { type: 'DodecahedronBufferGeometry', args: [1.5, 0] },
    color: '#ec4899',
    stats: {
      size: 1.5 * 2, // Approx diameter
      baseHealth: 80,
      healthPerWaveIncrement: 0, // Alpha6: (80 + Math.floor(score / 1000)) * (waveCount > 1 ? 1.5 : 1); complex, simplify for now
      scoreToHealthFactor: 0.001, // Every 1000 score adds 1 health
      waveCountHealthMultiplier: 1.5, // if waveCount > 1
      targetY: 2.5, // Scaled for R3F units (e.g. 150 pixels from top in a ~600px height canvas)
      phaseEnterSpeedFactor: 0.05,
      speedX: 2 * 0.05, // Horizontal movement speed
      shootCooldownBase: 50, // frames
      shootCooldownFast: 30, // frames, when health < 50%
      healthThresholdForSpeedUp: 0.5,
      points: 5000,
      attackPatterns: [ // Define patterns based on Alpha6
        { name: '6_way_spread', params: { bulletSpeed: 2.5 * 0.05, angleOffsetRate: 2 } },
        { name: '3_way_forward', params: { bulletSpeed: 5 * 0.05, spread: 1.5 * 0.05 } }
      ]
    }
  },
  behemoth: {
    name: 'Behemoth', // Alpha6 BOSS_MODEL_2
    geometry: { type: 'IcosahedronBufferGeometry', args: [1.8, 0] },
    color: '#00ffff',
    stats: {
      size: 1.8 * 2,
      baseHealth: 100,
      healthPerWaveIncrement: 0,
      scoreToHealthFactor: 0.001,
      waveCountHealthMultiplier: 1.5,
      targetY: 2.5,
      phaseEnterSpeedFactor: 0.05,
      speedX: 1.5 * 0.05,
      shootCooldownBase: 60,
      shootCooldownFast: 40,
      healthThresholdForSpeedUp: 0.5,
      points: 7500,
      attackPatterns: [
        { name: '6_way_spread', params: { bulletSpeed: 2.5 * 0.05, angleOffsetRate: 2 } },
        { name: '3_way_forward', params: { bulletSpeed: 5 * 0.05, spread: 1.5 * 0.05 } },
        { name: 'homing_spread_player', params: { bulletSpeed: 4 * 0.05, count: 3, angleSpread: 0.2 } }
      ]
    }
  }
};

export const OBSTACLE_TYPES = {
  asteroid: {
    name: 'Asteroid',
    geometry: { type: 'SphereBufferGeometry', args: [0.7, 8, 8] },
    color: '#a1a1aa',
    stats: {
      sizeMin: 0.4, // Scaled from Alpha6: (Math.random() * 20 + 15) -> (0.04 scale) -> 0.6 to 1.4 diameter
      sizeMax: 1.0,
      speedYMin: 0.5 * 0.02, // Scaled for R3F (slower than enemies)
      speedYMax: 1.5 * 0.02,
      rotationSpeedFactor: 0.02,
      baseHealthFactor: 0.1, // Health is size / 10 in Alpha6, so size * baseHealthFactor
      materialDropChance: 0.3,
    }
  },
  blackhole: {
    name: 'Blackhole',
    geometry: { type: 'SphereBufferGeometry', args: [1.0, 16, 16]},
    color: '#000000', // Will need special rendering
    stats: {
      sizeMin: 0.8, // Scaled from Alpha6: (Math.random() * 30 + 40) -> 1.6 to 2.8 diameter
      sizeMax: 1.6,
      gravityWellSizeFactor: 4, // Gravity well is size * factor
      gravityPullStrength: 0.002, // Scaled pull factor, needs tuning
      lifespanFrames: 600,
      damageOnContact: true, // Player.hit() if dist < this.size
    }
  }
};

export const POWERUP_TYPES = {
  shield: {
    name: 'Shield',
    color: '#60a5fa',
    effect: { type: 'add_shield', value: 1 }
  },
  minion: {
    name: 'Minion',
    color: '#a78bfa',
    effect: { type: 'add_minion' }
  },
  ghost: {
    name: 'Ghost Mode',
    color: '#e5e7eb',
    effect: { type: 'activate_ghost_timer', durationFrames: 300 }
  },
  bomb: {
    name: 'Bomb Stock',
    color: '#ffffff',
    effect: { type: 'add_bomb', value: 1 }
  },
  material: {
    name: 'Raw Material',
    color: '#94a3b8',
    effect: { type: 'add_material', value: 1 }
  }
};

export const DEFAULT_PLAYER_UFO_ID = 'interceptor';

export const getInitialPlayerStats = () => {
    const ufo = UFO_TYPES[DEFAULT_PLAYER_UFO_ID];
    if (!ufo) throw new Error(`Default UFO ID ${DEFAULT_PLAYER_UFO_ID} not found in UFO_TYPES.`);
    return {
        health: ufo.stats.health,
        shield: ufo.stats.shield,
        bombs: ufo.stats.startBombs || 0,
     };
};
