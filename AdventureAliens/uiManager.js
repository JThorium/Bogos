// Global variables that will be passed from the main game file
let playerState;
let upgradeData;
let saveState;
let dnaCounter;
let outfitGrid;
let weaponGrid;

export function setUIManagerDependencies(deps) {
    playerState = deps.playerState;
    upgradeData = deps.upgradeData;
    saveState = deps.saveState;
    dnaCounter = deps.dnaCounter;
    outfitGrid = deps.outfitGrid;
    weaponGrid = deps.weaponGrid;
}

export function renderAll() {
    dnaCounter.textContent = playerState.dna;
    outfitGrid.innerHTML = '';
    weaponGrid.innerHTML = '';

    Object.keys(upgradeData).forEach(id => {
        const upgrade = upgradeData[id];
        const card = createUpgradeCard(id, upgrade);
        if (upgrade.category === 'outfit') {
            outfitGrid.appendChild(card);
        } else if (upgrade.category === 'weapon') {
            weaponGrid.appendChild(card);
        }
    });
}

function createUpgradeCard(id, upgrade) {
    const level = playerState.upgrades[id] || 0;
    const isMaxed = level >= upgrade.maxLevel;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
    const canAfford = playerState.dna >= cost;

    const card = document.createElement('div');
    card.className = 'upgrade-card p-3 rounded-lg flex flex-col justify-between';
    const currentEffect = level > 0 ? upgrade.getEffect(level) : 'None';
    const nextEffect = !isMaxed ? upgrade.getNextEffect(level) : '---';
    const costColor = canAfford ? 'text-green-400' : 'text-red-400';

    card.innerHTML = `
        <div>
            <h4 class="text-md md:text-lg text-yellow-300 mb-1">${upgrade.name}</h4>
            <p class="text-xs text-gray-400 mb-2">${upgrade.description}</p>
            <p class="text-sm text-cyan-300">Level: <span>${level}</span>/<span>${upgrade.maxLevel}</span></p>
            <p class="text-sm text-white">Current Effect: <span>${currentEffect}</span></p>
            <p class="text-sm text-gray-300">Next: <span>${nextEffect}</span></p>
        </div>
        <div class="mt-3 flex justify-between items-center">
            <span class="text-sm ${costColor} font-bold">Cost: <span>${isMaxed ? '---' : cost}</span> DNA</span>
            <button class="menu-button bg-green-600 text-white px-4 py-1 rounded-md text-sm upgrade-button" data-upgrade-id="${id}" ${isMaxed || !canAfford ? 'disabled' : ''}>
                ${isMaxed ? 'MAXED' : 'UPGRADE'}
            </button>
        </div>`;
    return card;
}

export function handlePurchase(event) {
    const button = event.target.closest('.upgrade-button');
    if (!button || button.disabled) return;
    
    const upgradeId = button.dataset.upgradeId;
    const upgrade = upgradeData[upgradeId];
    const level = playerState.upgrades[upgradeId] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));

    if (playerState.dna >= cost && level < upgrade.maxLevel) {
        playerState.dna -= cost;
        playerState.upgrades[upgradeId]++;
        saveState();
        renderAll();
    }
}
