// Dependencies will be injected via setUIManagerDependencies
let playerState, upgradeData, saveState, dnaCounter, outfitGrid, weaponGrid;

export function setUIManagerDependencies(dependencies) {
    ({ playerState, upgradeData, saveState, dnaCounter, outfitGrid, weaponGrid } = dependencies);
}

export function renderAll() { // Remove arguments, use injected dependencies
    dnaCounter.textContent = playerState.dna;
    outfitGrid.innerHTML = '';
    weaponGrid.innerHTML = '';

    Object.keys(upgradeData).forEach(id => {
        const upgrade = upgradeData[id];
        const card = createUpgradeCard(id, upgrade); // Call without dependencies
        if (upgrade.category === 'outfit') {
            outfitGrid.appendChild(card);
        } else if (upgrade.category === 'weapon') {
            weaponGrid.appendChild(card);
        }
    });
}

function createUpgradeCard(id, upgrade) { // Remove playerState, upgradeData from arguments
    const level = playerState.upgrades[id] || 0; // Use injected playerState
    const isMaxed = level >= upgrade.maxLevel;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
    const canAfford = playerState.dna >= cost; // Use injected playerState

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

export function handlePurchase(event) { // Remove playerState, upgradeData, saveState, renderAll, dnaCounter, outfitGrid, weaponGrid from arguments
    const button = event.target.closest('.upgrade-button');
    if (!button || button.disabled) return;
    
    const upgradeId = button.dataset.upgradeId;
    const upgrade = upgradeData[upgradeId]; // Use injected upgradeData
    const level = playerState.upgrades[upgradeId] || 0; // Use injected playerState
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));

    if (playerState.dna >= cost && level < upgrade.maxLevel) { // Use injected playerState
        playerState.dna -= cost; // Use injected playerState
        playerState.upgrades[upgradeId]++; // Use injected playerState
        saveState(); // Call injected saveState
        renderAll(); // Call without dependencies
    }
}
