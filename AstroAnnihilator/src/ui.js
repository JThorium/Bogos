import {
    score, highScore, health, shield,
    materialsFound, shopCredits,
    pauseStarCredits, hangarCredits, hangarMaterials, fusionCredits, fusionSlotsAvailable,
    setScore, setHighScore, setStarCredits, setRawMaterials, setMaterialsThisRun,
    setHasPurchasedScoreBoost, setSpawnMultiplier, setIsPaused, setIsGameOver,
    setGameMode, setFusionConfig, setIsCombineAllActive, setSelectedUFO,
    setUpgrades, setBombPurchaseCost, setHealthPurchaseCost, setShieldPurchaseCost,
    setShopCosts, setMusicInitialized, setNormalMusicLoop, setBossMusicLoop, setTitleClickCount,
    UFO_TYPES, unlockedUFOs, upgrades, defaultUpgrades,
    hasPurchasedScoreBoost, spawnMultiplier, gameMode, fusionConfig, isCombineAllActive,
    selectedUFO, starCredits, rawMaterials, titleClickCount, currentBoss, isPaused, isGameOver,
    player, waveCredits, shopCosts
} from './gameData.js';
import { init, gameLoop, quitToMainMenu, togglePause, useBombAction, initAudio, startMusic, stopMusic } from './game.js';
import { sfx } from './audio.js';

// UI Elements (now accessed globally via window.uiElements)
// export let uiElements = {}; // No longer exported directly

export function initializeUIElements() {
    const elements = {};
    elements.scoreEl = document.getElementById('score');
    elements.highScoreEl = document.getElementById('highScore');
    elements.healthEl = document.getElementById('health');
    elements.shieldEl = document.getElementById('shield');
    elements.creditsEl = document.getElementById('credits');
    elements.bombsEl = document.getElementById('bombs');
    elements.abilityChargeUI = document.getElementById('abilityChargeUI');
    elements.abilityChargeEl = document.getElementById('abilityCharge');
    elements.modalContainer = document.getElementById('modalContainer');
    elements.startScreen = document.getElementById('startScreen');
    elements.pauseScreen = document.getElementById('pauseScreen');
    elements.gameOverScreen = document.getElementById('gameOverScreen');
    elements.hangarScreen = document.getElementById('hangarScreen');
    elements.inGameShop = document.getElementById('inGameShop');
    elements.devScreen = document.getElementById('devScreen');
    elements.pauseButton = document.getElementById('pauseButton');
    elements.startButton = document.getElementById('startButton');
    elements.resumeButton = document.getElementById('resumeButton');
    elements.restartButton = document.getElementById('restartButton');
    elements.hangarButton = document.getElementById('hangarButton');
    elements.hangarBackButton = document.getElementById('hangarBackButton');
    elements.quitButton = document.getElementById('quitButton');
    elements.continueButton = document.getElementById('continueButton');
    elements.devButton = document.getElementById('devButton');
    elements.resetProgressButton = document.getElementById('resetProgressButton');
    elements.gameTitle = document.getElementById('gameTitle');
    elements.finalScoreEl = document.getElementById('finalScore');
    elements.creditsEarnedEl = document.getElementById('creditsEarned');
    elements.materialsFoundEl = document.getElementById('materialsFound');
    elements.shopCreditsEl = document.getElementById('shopCredits');
    elements.shopItemsEl = document.getElementById('shopItems');
    elements.bossHealthBarContainer = document.getElementById('bossHealthBarContainer');
    elements.bossHealthEl = document.getElementById('bossHealth');
    elements.bossNameEl = document.getElementById('bossName');
    elements.bottomUiContainer = document.getElementById('bottomUiContainer');
    elements.bombButtonLeft = document.getElementById('bombButtonLeft');
    elements.bombButtonRight = document.getElementById('bombButtonRight');
    elements.abilityButton = document.getElementById('abilityButton');
    elements.audioStatusEl = document.getElementById('audio-status');
    elements.hangarView = document.getElementById('hangarView');
    elements.hangarViewHeader = document.getElementById('hangarViewHeader');
    elements.hangarCreditsEl = document.getElementById('hangarCredits');
    elements.hangarMaterialsEl = document.getElementById('hangarMaterials');
    elements.sellMaterialButton = document.getElementById('sellMaterialButton');
    elements.metaGrid = document.getElementById('metaGrid');
    elements.upgradeGrid = document.getElementById('upgradeGrid');
    elements.hangarShipSelector = document.getElementById('hangarShipSelector');
    elements.toFusionLabButton = document.getElementById('toFusionLabButton');
    elements.fusionLabView = document.getElementById('fusionLabView');
    elements.fusionLabViewHeader = document.getElementById('fusionLabViewHeader');
    elements.fusionCreditsEl = document.getElementById('fusionCredits');
    elements.fusionSlotsAvailableEl = document.getElementById('fusionSlotsAvailable');
    elements.fusionSlotsContainer = document.getElementById('fusionSlotsContainer');
    elements.fusionShipSource = document.getElementById('fusionShipSource');
    elements.toHangarButton = document.getElementById('toHangarButton');
    elements.clearFusionButton = document.getElementById('clearFusionButton');
    elements.combineAllButton = document.getElementById('combineAllButton');
    elements.gameModeInfoEl = document.getElementById('gameModeInfo');
    elements.pauseStarCreditsEl = document.getElementById('pauseStarCredits');
    elements.pauseShipSelectorEl = document.getElementById('pauseShipSelector');
    elements.pauseUpgradeGridEl = document.getElementById('pauseUpgradeGrid');
    elements.pauseBuyGridEl = document.getElementById('pauseBuyGrid');
    elements.devScoreInputEl = document.getElementById('devScoreInput');
    elements.devSetScoreButton = document.getElementById('devSetScoreButton');
    elements.devCreditsInputEl = document.getElementById('devCreditsInput');
    elements.devSetCreditsButton = document.getElementById('devSetCreditsButton');
    elements.devMaterialsInputEl = document.getElementById('devMaterialsInput');
    elements.devSetMaterialsButton = document.getElementById('devSetMaterialsButton');
    elements.devUnlockAllButton = document.getElementById('devUnlockAllButton');
    elements.devBackButton = document.getElementById('devBackButton');
    return elements;
}

export function hideAllModals() {
    [window.uiElements.startScreen, window.uiElements.pauseScreen, window.uiElements.gameOverScreen, window.uiElements.hangarScreen, window.uiElements.inGameShop, window.uiElements.devScreen].forEach(m => m.style.display = 'none');
    window.uiElements.modalContainer.style.pointerEvents = 'none';
}

export function showModal(modalElement) {
    hideAllModals();
    modalElement.style.display = modalElement.id === 'pauseScreen' || modalElement.id === 'hangarScreen' ? 'flex' : 'block';
    window.uiElements.modalContainer.style.pointerEvents = 'all';
}

export function handleGameOverUI() {
    stopMusic();
    if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('highScore', highScore);
    }
    const scoreCredits = Math.floor(score / 250);
    const bonusCredits = Math.floor(scoreCredits * (upgrades.creditBonus.level * 0.05));
    const totalCreditsEarned = scoreCredits + waveCredits + bonusCredits;
    setStarCredits(starCredits + totalCreditsEarned);
    setRawMaterials(rawMaterials + materialsThisRun);
    localStorage.setItem('starCredits', starCredits);
    localStorage.setItem('rawMaterials', rawMaterials);
    window.uiElements.finalScoreEl.textContent = score.toLocaleString();
    window.uiElements.creditsEarnedEl.textContent = `${totalCreditsEarned.toLocaleString()} (${scoreCredits.toLocaleString()} + ${waveCredits.toLocaleString()} + ${bonusCredits.toLocaleString()} bonus)`;
    window.uiElements.materialsFoundEl.textContent = materialsThisRun.toLocaleString();
    showModal(window.uiElements.gameOverScreen);
    window.uiElements.bottomUiContainer.style.display = 'none';
}

export function updateShipSelector(container, isHangarView) {
    container.innerHTML = '';
    const refreshCallback = isHangarView ? updateHangarUI : updatePauseMenuUI;
    Object.keys(UFO_TYPES).forEach(key => {
        if (isHangarView && UFO_TYPES[key].unlockMethod === 'score') return;
        const ufo = UFO_TYPES[key];
        const isUnlocked = unlockedUFOs.has(key);
        const card = document.createElement('div');
        card.className = `ship-select-card p-2 rounded-lg text-left flex flex-col justify-between h-full ${isUnlocked ? '' : 'locked'} ${selectedUFO === key && gameMode === 'classic' ? 'selected' : ''}`;
        let statusText = isUnlocked ? 'Unlocked' : (ufo.unlockMethod === 'score' ? `Unlock at ${ufo.unlockScore.toLocaleString()} pts` : `Cost: ${ufo.cost.toLocaleString()} CR`);
        card.innerHTML = `<div><h4 class="text-sm sm:text-base font-bold leading-tight" style="color:${ufo.color}">${ufo.name}</h4><p class="text-[10px] sm:text-xs text-gray-300 mt-1 leading-snug">${ufo.ability}</p></div><p class="text-[10px] sm:text-xs text-gray-400 mt-2 leading-snug">${statusText}</p>`;
        if (!isUnlocked && ufo.unlockMethod === 'credits' && starCredits >= ufo.cost) {
            const buyButton = document.createElement('button');
            buyButton.className = 'menu-button bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-xs w-full mt-2';
            buyButton.textContent = 'BUY SHIP';
            buyButton.onclick = (e) => {
                e.stopPropagation();
                buyUFO(key, refreshCallback);
            };
            card.appendChild(buyButton);
        }
        if (isUnlocked && !isGameOver) {
            card.addEventListener('click', () => {
                setSelectedUFO(key);
                setGameMode('classic');
                setIsCombineAllActive(false);
                localStorage.setItem('selectedUFO', key);
                localStorage.setItem('gameMode', 'classic');
                localStorage.setItem('isCombineAllActive', 'false');
                if (player && isPaused) player.reset();
                if (isHangarView) {
                    updateHangarUI();
                    updateStartScreenInfo();
                } else {
                    refreshCallback();
                }
            });
        }
        container.appendChild(card);
    });
}

export function buyUFO(key, refreshCallback) {
    const ufo = UFO_TYPES[key];
    if (starCredits >= ufo.cost && !unlockedUFOs.has(key)) {
        setStarCredits(starCredits - ufo.cost);
        unlockedUFOs.add(key);
        localStorage.setItem('starCredits', starCredits);
        localStorage.setItem('unlockedUFOs', JSON.stringify([...unlockedUFOs]));
        sfx.buy.triggerAttackRelease("E5", "8n");
        if (refreshCallback) refreshCallback();
    }
}

export function updateHangarUI() {
    console.log('updateHangarUI() function called in ui.js');
    updateHangarLikeUI(window.uiElements.hangarCreditsEl, window.uiElements.hangarShipSelector, window.uiElements.upgradeGrid, true);
    window.uiElements.hangarMaterialsEl.textContent = rawMaterials.toLocaleString();
    updateFusionLabUI();
}

export function updatePauseMenuUI() {
    updateHangarLikeUI(window.uiElements.pauseStarCreditsEl, window.uiElements.pauseShipSelectorEl, window.uiElements.pauseUpgradeGridEl, false);
}

export function updateHangarLikeUI(creditsElement, shipSelectorElement, upgradeGridElement, isHangarView) {
    creditsElement.textContent = starCredits.toLocaleString();
    if (shipSelectorElement) updateShipSelector(shipSelectorElement, isHangarView);
    if (isHangarView) {
        window.uiElements.metaGrid.innerHTML = '';
        const boostCost = 1000;
        const boostCard = document.createElement('div');
        boostCard.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center';
        boostCard.innerHTML = `<h4 class="text-lg font-bold text-amber-400">Score Boost</h4><p class="text-sm my-2">Start with 1/3 high score.<br/>(${Math.floor(highScore / 3).toLocaleString()} score)</p><button id="buy-score-boost" class="menu-button bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">${hasPurchasedScoreBoost ? 'ACTIVE' : `BUY (${boostCost.toLocaleString()} CR)`}</button>`;
        const boostButton = boostCard.querySelector('#buy-score-boost');
        if (hasPurchasedScoreBoost || starCredits < boostCost || highScore < 1000) boostButton.disabled = true;
        boostButton.addEventListener('click', () => {
            if (starCredits >= boostCost) {
                setStarCredits(starCredits - boostCost);
                setHasPurchasedScoreBoost(true);
                localStorage.setItem('starCredits', starCredits);
                localStorage.setItem('hasPurchasedScoreBoost', 'true');
                sfx.buy.triggerAttackRelease("A4", "8n");
                updateHangarUI();
            }
        });
        window.uiElements.metaGrid.appendChild(boostCard);

        const challengeCard = document.createElement('div');
        challengeCard.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center';
        let challengeBtnHtml;
        if (spawnMultiplier >= 4) {
            challengeBtnHtml = `<button class="menu-button w-full" disabled>MAXIMUM CARNAGE</button>`;
        } else if (spawnMultiplier >= 2) {
            challengeBtnHtml = `<button id="buy-challenge-2" class="menu-button bg-red-800 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">REALLY BRING IT ON!!</button>`;
        } else {
            challengeBtnHtml = `<button id="buy-challenge-1" class="menu-button bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">Bring It On!</button>`;
        }
        challengeCard.innerHTML = `<h4 class="text-lg font-bold text-red-400">Challenge Mode</h4><p class="text-sm my-2">Spawn Rate: x${spawnMultiplier}</p>${challengeBtnHtml}`;
        window.uiElements.metaGrid.appendChild(challengeCard);

        const challengeBtn1 = challengeCard.querySelector('#buy-challenge-1');
        const challengeBtn2 = challengeCard.querySelector('#buy-challenge-2');
        if (challengeBtn1) {
            const cost = 100000;
            if (starCredits < cost) challengeBtn1.disabled = true;
            challengeBtn1.textContent += ` (${cost.toLocaleString()} CR)`;
            challengeBtn1.addEventListener('click', () => {
                if (starCredits >= cost) {
                    setStarCredits(starCredits - cost);
                    setSpawnMultiplier(2);
                    localStorage.setItem('starCredits', starCredits);
                    localStorage.setItem('spawnMultiplier', spawnMultiplier);
                    sfx.unlock.triggerAttackRelease(['C3', 'E3', 'G3'], '2n');
                    updateHangarUI();
                }
            });
        }
        if (challengeBtn2) {
            const cost = 1000000;
            if (starCredits < cost) challengeBtn2.disabled = true;
            challengeBtn2.textContent += ` (${cost.toLocaleString()} CR)`;
            challengeBtn2.addEventListener('click', () => {
                if (starCredits >= cost) {
                    setStarCredits(starCredits - cost);
                    setSpawnMultiplier(4);
                    localStorage.setItem('starCredits', starCredits);
                    localStorage.setItem('spawnMultiplier', spawnMultiplier);
                    sfx.unlock.triggerAttackRelease(['C2', 'E2', 'G2'], '1n');
                    updateHangarUI();
                }
            });
        }
    }

        upgradeGridElement.innerHTML = '';
        const refreshCallback = isHangarView ? updateHangarUI : updatePauseMenuUI;
        Object.keys(upgrades).forEach(key => {
            const upg = upgrades[key];
            const currentCost = upg.cost + upg.costIncrease * upg.level;
            const matCost = upg.matCost + upg.matIncrease * upg.level;
            const isMaxed = upg.level >= upg.maxLevel;

            const card = document.createElement('div');
            card.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center';
            card.innerHTML = `<h4 class="text-lg font-bold text-amber-400">${upg.name}</h4><p class="text-sm my-2">Level: ${upg.level} / ${upg.maxLevel}</p><button id="buy-${key}-${isHangarView ? 'h' : 'p'}" class="menu-button bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full">${isMaxed ? 'MAX LEVEL' : `UPGRADE (${currentCost.toLocaleString()} CR + ${matCost} [M])`}</button>`;
            const buyButton = card.querySelector(`#buy-${key}-${isHangarView ? 'h' : 'p'}`);
            if (isMaxed || starCredits < currentCost || rawMaterials < matCost) buyButton.disabled = true;
            buyButton.addEventListener('click', () => {
                if (buyUpgrade(key)) refreshCallback();
            });
            upgradeGridElement.appendChild(card);
        });

        if (!isHangarView) {
            window.uiElements.pauseBuyGridEl.innerHTML = '';
            const items = [
                { name: 'Buy Health', cost: healthPurchaseCost, action: () => { player.health++; setHealthPurchaseCost(Math.floor(healthPurchaseCost * 1.5)); } },
                { name: 'Buy Shield', cost: shieldPurchaseCost, action: () => { player.shield++; setShieldPurchaseCost(Math.floor(shieldPurchaseCost * 1.5)); } },
                { name: 'Buy Bomb', cost: bombPurchaseCost, action: () => { player.bombs++; setBombPurchaseCost(Math.floor(bombPurchaseCost * 1.5)); } }
            ];
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'upgrade-card p-4 rounded-lg flex flex-col items-center text-center';
                card.innerHTML = `<h4 class="text-lg font-bold text-amber-400">${item.name}</h4><button class="menu-button bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm w-full mt-2">BUY (${item.cost.toLocaleString()} CR)</button>`;
                const btn = card.querySelector('button');
                if (starCredits < item.cost) btn.disabled = true;
                btn.addEventListener('click', () => {
                    if (starCredits >= item.cost) {
                        setStarCredits(starCredits - item.cost);
                        item.action();
                        localStorage.setItem('starCredits', starCredits);
                        sfx.buy.triggerAttackRelease("C4", "8n");
                        refreshCallback();
                    }
                });
                window.uiElements.pauseBuyGridEl.appendChild(card);
            });
        }
    }

export function buyUpgrade(key) {
    const upg = upgrades[key];
    const creditCost = upg.cost + upg.costIncrease * upg.level;
    const matCost = upg.matCost + upg.matIncrease * upg.level;
    if (starCredits >= creditCost && rawMaterials >= matCost && upg.level < upg.maxLevel) {
        setStarCredits(starCredits - creditCost);
        setRawMaterials(rawMaterials - matCost);
        upg.level++;
        localStorage.setItem('starCredits', starCredits);
        localStorage.setItem('rawMaterials', rawMaterials);
        localStorage.setItem('upgrades', JSON.stringify(upgrades));
        sfx.buy.triggerAttackRelease("E4", "8n");
        return true;
    }
    return false;
}

export function showInGameShopUI() {
    setIsPaused(true);
    Tone.Transport.pause();
    window.uiElements.shopCreditsEl.textContent = waveCredits;
    window.uiElements.shopItemsEl.innerHTML = '';
    const items = [
        { name: 'Repair Hull', cost: shopCosts.health, action: () => { player.health++; setShopCosts({ ...shopCosts, health: Math.floor(shopCosts.health * 1.8) }); } },
        { name: 'Add Shield', cost: shopCosts.shield, action: () => { player.shield++; setShopCosts({ ...shopCosts, shield: Math.floor(shopCosts.shield * 1.5) }); } },
        { name: 'Add Bomb', cost: shopCosts.bomb, action: () => { player.bombs++; setShopCosts({ ...shopCosts, bomb: Math.floor(shopCosts.bomb * 1.6) }); } },
        { name: 'Add Minion', cost: shopCosts.minion, action: () => { player.addMinion(); setShopCosts({ ...shopCosts, minion: Math.floor(shopCosts.minion * 2) }); } }
    ];
    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'upgrade-card p-3 rounded-lg text-center flex flex-col justify-between';
        itemEl.innerHTML = `<h4 class="text-base text-amber-400">${item.name}</h4>`;
        const buyButton = document.createElement('button');
        buyButton.className = 'menu-button bg-blue-600 text-white font-bold py-1 px-3 mt-2 rounded-lg text-sm w-full';
        buyButton.textContent = `BUY (${item.cost} CR)`;
        if (waveCredits < item.cost) buyButton.disabled = true;
        buyButton.onclick = () => {
            if (waveCredits >= item.cost) {
                setWaveCredits(waveCredits - item.cost);
                item.action();
                sfx.buy.triggerAttackRelease("C4", "8n");
                showInGameShopUI();
            }
        };
        itemEl.appendChild(buyButton);
        window.uiElements.shopItemsEl.appendChild(itemEl);
    });
    showModal(window.uiElements.inGameShop);
}

export function updateFusionLabUI() {
    window.uiElements.fusionCreditsEl.textContent = starCredits.toLocaleString();
    const slotsUnlocked = (highScore >= 50000 ? 5 : highScore >= 40000 ? 4 : highScore >= 30000 ? 3 : highScore >= 20000 ? 2 : 1);
    window.uiElements.fusionSlotsAvailableEl.textContent = `${fusionConfig.length} / ${slotsUnlocked}`;
    window.uiElements.fusionSlotsContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'fusion-slot rounded-lg p-2 flex items-center justify-center text-center';
        if (i < slotsUnlocked) {
            const ufoKey = fusionConfig[i];
            if (ufoKey) {
                const ufo = UFO_TYPES[ufoKey];
                slot.classList.add('filled');
                slot.innerHTML = `<div class="text-sm"><h4 style="color:${ufo.color}">${ufo.name}</h4></div>`;
            } else {
                slot.innerHTML = `<p class="text-xs text-gray-500">SLOT ${i + 1}</p>`;
            }
        } else {
            slot.classList.add('locked');
            slot.innerHTML = `<p class="text-xs text-gray-600">LOCKED<br/>(Score > ${(i) * 10000 + 10000})</p>`;
        }
        window.uiElements.fusionSlotsContainer.appendChild(slot);
    }

    window.uiElements.fusionShipSource.innerHTML = '';
    Object.keys(UFO_TYPES).forEach(key => {
        if (key === 'omega') return;
        const ufo = UFO_TYPES[key];
        if (!unlockedUFOs.has(key)) return;
        const card = document.createElement('div');
        const isFused = fusionConfig.includes(key);
        card.className = `ship-select-card p-2 rounded-lg text-center fusion-source-ship ${isFused ? 'fused' : ''}`;
        card.innerHTML = `<h4 class="text-sm font-bold" style="color:${ufo.color}">${ufo.name}</h4>`;
        if (!isFused) {
            card.addEventListener('click', () => addShipToFusion(key));
        }
        window.uiElements.fusionShipSource.appendChild(card);
    });
    window.uiElements.combineAllButton.style.display = highScore >= 100000 ? 'inline-flex' : 'none';
}

export function addShipToFusion(ufoKey) {
    const slotsUnlocked = (highScore >= 50000 ? 5 : highScore >= 40000 ? 4 : highScore >= 30000 ? 3 : highScore >= 20000 ? 2 : 1);
    if (fusionConfig.length < slotsUnlocked) {
        fusionConfig.push(ufoKey);
        setGameMode('fusion');
        setIsCombineAllActive(false);
        localStorage.setItem('fusionConfig', JSON.stringify(fusionConfig));
        localStorage.setItem('gameMode', 'fusion');
        localStorage.setItem('isCombineAllActive', 'false');
        updateFusionLabUI();
        updateStartScreenInfo();
    }
}

export function clearFusion() {
    setFusionConfig([]);
    setIsCombineAllActive(false);
    setGameMode('classic');
    localStorage.setItem('fusionConfig', '[]');
    localStorage.setItem('gameMode', 'classic');
    localStorage.setItem('isCombineAllActive', 'false');
    updateFusionLabUI();
    updateStartScreenInfo();
}

export function activateCombineAll() {
    setIsCombineAllActive(true);
    setGameMode('fusion');
    setFusionConfig([]);
    localStorage.setItem('isCombineAllActive', 'true');
    localStorage.setItem('gameMode', 'fusion');
    localStorage.setItem('fusionConfig', '[]');
    setSelectedUFO('interceptor');
    localStorage.setItem('selectedUFO', 'interceptor');
    updateFusionLabUI();
    updateStartScreenInfo();
    alert('CHIMERA MODE ACTIVATED!');
}

export function updateStartScreenInfo() {
    if (selectedUFO === 'omega') {
        window.uiElements.gameModeInfoEl.textContent = `MODE: OMEGA`;
    } else if (gameMode === 'fusion' && (fusionConfig.length > 0 || isCombineAllActive)) {
        const shipName = isCombineAllActive ? 'CHIMERA' : 'FUSION SHIP';
        window.uiElements.gameModeInfoEl.textContent = `MODE: FUSION (${shipName})`;
    } else {
        window.uiElements.gameModeInfoEl.textContent = `MODE: CLASSIC (${UFO_TYPES[selectedUFO].name})`;
    }
}

export function updateUI(force = false) {
    if (force || uiState.score !== score) { setUiState('score', score); window.uiElements.scoreEl.textContent = score.toLocaleString(); }
    if (force || uiState.highScore !== highScore) { setUiState('highScore', highScore); window.uiElements.highScoreEl.textContent = highScore.toLocaleString(); }
    if (player) {
        if (force || uiState.health !== player.health) { setUiState('health', player.health); window.uiElements.healthEl.textContent = player.health; }
        if (force || uiState.shield !== player.shield) { setUiState('shield', player.shield); window.uiElements.shieldEl.textContent = player.shield; }
        if (force || uiState.bombs !== player.bombs) { setUiState('bombs', player.bombs); window.uiElements.bombsEl.textContent = player.bombs; }
        if (player.abilityState && player.abilities.paladin && (force || uiState.ability !== player.abilityState.charge)) { setUiState('ability', player.abilityState.charge); window.uiElements.abilityChargeEl.textContent = player.abilityState.charge; window.uiElements.abilityChargeUI.style.display = 'block' }
        else if (!player.abilities.paladin && !player.abilityState.active) { window.uiElements.abilityChargeUI.style.display = 'none' }
    }
    if (force || uiState.credits !== waveCredits) { setUiState('credits', waveCredits); window.uiElements.creditsEl.textContent = waveCredits.toLocaleString(); }
    if (currentBoss) { window.uiElements.bossHealthEl.textContent = `${Math.ceil(currentBoss.health).toLocaleString()}/${currentBoss.maxHealth.toLocaleString()}`; }
}

export function resizeCanvas(canvas, wrapper) {
    window.screenWidth = wrapper.clientWidth;
    window.screenHeight = wrapper.clientHeight;
    canvas.width = window.screenWidth;
    canvas.height = window.screenHeight;
    if (player) player.y = window.screenHeight - 100 - MOUSE_Y_OFFSET;
}

export function setGameSize(wrapper, canvas) {
    wrapper.style.height = `${window.innerHeight}px`;
    resizeCanvas(canvas, wrapper);
}

export function setupEventListeners(canvas, wrapper) {
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        window.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        window.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        window.mouse.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
        window.mouse.y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    }, { passive: false });

    window.uiElements.startButton.addEventListener('click', init);
    window.uiElements.resumeButton.addEventListener('click', togglePause);
    window.uiElements.restartButton.addEventListener('click', init);
    window.uiElements.pauseButton.addEventListener('click', togglePause);
    window.uiElements.hangarButton.addEventListener('click', () => { updateHangarUI(); showModal(window.uiElements.hangarScreen); });
    window.uiElements.hangarBackButton.addEventListener('click', () => { showModal(window.uiElements.startScreen); updateStartScreenInfo(); });
    window.uiElements.continueButton.addEventListener('click', () => { setIsPaused(false); hideAllModals(); Tone.Transport.start(); gameLoop(); player.ghostTimer = 180; });
    window.uiElements.quitButton.addEventListener('click', quitToMainMenu);
    window.uiElements.bombButtonLeft.addEventListener('click', useBombAction);
    window.uiElements.bombButtonRight.addEventListener('click', useBombAction);
    window.uiElements.abilityButton.addEventListener('pointerdown', () => { setIsAbilityHeld(true); });
    document.body.addEventListener('pointerup', () => { setIsAbilityHeld(false); if (player) player.releaseAbility(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !isGameOver && player) togglePause();
        if (e.code === 'Space') useBombAction();
    });
    window.uiElements.toFusionLabButton.addEventListener('click', () => { window.uiElements.hangarView.style.display = 'none'; window.uiElements.hangarViewHeader.style.display = 'none'; window.uiElements.fusionLabView.style.display = 'block'; window.uiElements.fusionLabViewHeader.style.display = 'block'; });
    window.uiElements.toHangarButton.addEventListener('click', () => { window.uiElements.fusionLabView.style.display = 'none'; window.uiElements.fusionLabViewHeader.style.display = 'none'; window.uiElements.hangarView.style.display = 'block'; window.uiElements.hangarViewHeader.style.display = 'block'; });
    window.uiElements.clearFusionButton.addEventListener('click', clearFusion);
    window.uiElements.combineAllButton.addEventListener('click', activateCombineAll);
    window.uiElements.sellMaterialButton.addEventListener('click', () => {
        if (rawMaterials > 0) {
            setRawMaterials(rawMaterials - 1);
            setStarCredits(starCredits + 25);
            localStorage.setItem('rawMaterials', rawMaterials);
            localStorage.setItem('starCredits', starCredits);
            updateHangarUI();
        }
    });
    window.uiElements.devButton.addEventListener('click', () => showModal(window.uiElements.devScreen));
    window.uiElements.devBackButton.addEventListener('click', () => showModal(window.uiElements.startScreen));
    window.uiElements.devSetScoreButton.addEventListener('click', () => {
        const newScore = parseInt(window.uiElements.devScoreInputEl.value);
        if (!isNaN(newScore)) {
            setScore(newScore);
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('highScore', highScore);
            }
            updateUI(true);
        }
        window.uiElements.devScoreInputEl.value = '';
    });
    window.uiElements.devSetCreditsButton.addEventListener('click', () => {
        const newCredits = parseInt(window.uiElements.devCreditsInputEl.value);
        if (!isNaN(newCredits)) {
            setStarCredits(newCredits);
            localStorage.setItem('starCredits', starCredits);
        }
        window.uiElements.devCreditsInputEl.value = '';
    });
    window.uiElements.devSetMaterialsButton.addEventListener('click', () => {
        const newMaterials = parseInt(window.uiElements.devMaterialsInputEl.value);
        if (!isNaN(newMaterials)) {
            setRawMaterials(newMaterials);
            localStorage.setItem('rawMaterials', rawMaterials);
        }
        window.uiElements.devMaterialsInputEl.value = '';
    });
    window.uiElements.devUnlockAllButton.addEventListener('click', () => {
        setStarCredits(9999999);
        setRawMaterials(99999);
        setHighScore(100000);
        localStorage.setItem('highScore', highScore);
        Object.keys(UFO_TYPES).forEach(key => unlockedUFOs.add(key));
        Object.keys(upgrades).forEach(key => upgrades[key].level = upgrades[key].maxLevel);
        localStorage.setItem('starCredits', starCredits);
        localStorage.setItem('rawMaterials', rawMaterials);
        localStorage.setItem('unlockedUFOs', JSON.stringify([...unlockedUFOs]));
        localStorage.setItem('upgrades', JSON.stringify(upgrades));
        if (musicInitialized) sfx.unlock.triggerAttackRelease(['C5', 'E5', 'G5', 'C6'], '2n');
        alert('All ships and upgrades unlocked/maxed! High score set to 100k.');
        updateHangarUI();
    });
    window.uiElements.gameTitle.addEventListener('click', () => {
        setTitleClickCount(titleClickCount + 1);
        if (titleClickCount >= 10) {
            window.uiElements.devButton.style.display = 'block';
            alert('Developer Menu Unlocked!');
        }
    });
    window.uiElements.resetProgressButton.addEventListener('click', () => {
        if (confirm('ARE YOU ABSOLUTELY SURE?\n\nThis will reset ALL progress, unlocks, and stats.\n\nThis action cannot be undone.')) {
            const keysToRemove = ['highScore', 'starCredits', 'rawMaterials', 'hasPurchasedScoreBoost', 'spawnMultiplier', 'upgrades', 'selectedUFO', 'unlockedUFOs', 'fusionConfig', 'isCombineAllActive', 'gameMode'];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            alert('All progress has been reset. The page will now reload.');
            location.reload();
        }
    });
    window.addEventListener('resize', () => setGameSize(wrapper, canvas));
}
