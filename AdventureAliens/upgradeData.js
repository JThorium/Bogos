export const upgradeData = {
    // OUTFIT UPGRADES
    exoskeletonPlating: {
        name: "Exoskeleton Plating",
        description: "Reinforces Xylar's suit, increasing maximum health.",
        maxLevel: 10,
        baseCost: 1,
        costMultiplier: 1.1,
        getEffect: (level) => `+${level * 10} Max Health`,
        getNextEffect: (level) => `+${(level + 1) * 10} Max Health`,
        category: 'outfit'
    },
    jetpackEfficiency: {
        name: "Jetpack Efficiency",
        description: "Improves fuel consumption for longer flight time.",
        maxLevel: 5,
        baseCost: 2,
        costMultiplier: 1.15,
        getEffect: (level) => `+${level * 10}% Efficiency`,
        getNextEffect: (level) => `+${(level + 1) * 10}% Efficiency`,
        category: 'outfit'
    },
    dnaMagnet: {
        name: "DNA Magnet",
        description: "Increases the collection radius for DNA drops.",
        maxLevel: 5,
        baseCost: 1,
        costMultiplier: 1.125,
        getEffect: (level) => `+${level * 20}% Radius`,
        getNextEffect: (level) => `+${(level + 1) * 20}% Radius`,
        category: 'outfit'
    },
    shieldEmitter: {
        name: "Shield Emitter",
        description: "Grants a regenerating shield that absorbs damage.",
        maxLevel: 8,
        baseCost: 2,
        costMultiplier: 1.15,
        getEffect: (level) => `+${level * 5} Shield HP`,
        getNextEffect: (level) => `+${(level + 1) * 5} Shield HP`,
        category: 'outfit'
    },
    emergencyWarp: {
        name: "Emergency Warp",
        description: "Unlocks a short-range dash to evade attacks. Upgrades reduce cooldown.",
        maxLevel: 5,
        baseCost: 5,
        costMultiplier: 1.2,
        getEffect: (level) => `Cooldown: ${10 - level * 1.5}s`,
        getNextEffect: (level) => `Cooldown: ${10 - (level + 1) * 1.5}s`,
        category: 'outfit'
    },
    // WEAPON UPGRADES
    laserCoreOvercharge: {
        name: "Laser Core Overcharge",
        description: "Increases base laser damage.",
        maxLevel: 10,
        baseCost: 1,
        costMultiplier: 1.1,
        getEffect: (level) => `+${level * 5}% Damage`,
        getNextEffect: (level) => `+${(level + 1) * 5}% Damage`,
        category: 'weapon'
    },
    rapidFireModule: {
        name: "Rapid Fire Module",
        description: "Increases the weapon's rate of fire.",
        maxLevel: 7,
        baseCost: 2,
        costMultiplier: 1.125,
        getEffect: (level) => `+${level * 7}% Fire Rate`,
        getNextEffect: (level) => `+${(level + 1) * 7}% Fire Rate`,
        category: 'weapon'
    },
    unlockPlasmaBlaster: {
        name: "Unlock: Plasma Blaster",
        description: "Unlocks the Plasma Blaster. Slower, high-damage explosive shots.",
        maxLevel: 1,
        baseCost: 50,
        costMultiplier: 1,
        getEffect: (level) => level > 0 ? 'Unlocked' : 'Locked',
        getNextEffect: (level) => 'Unlock Weapon',
        category: 'weapon'
    },
};
