import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { useGame } from './GameProvider';
import PlayerShip from './entities/PlayerShip';
import EnemyShip from './entities/EnemyShip';
import Bullet from './entities/Bullet';
import Starfield from './Starfield';
import { ufos } from './UFOData';

function GameScene() {
    const { viewport } = useThree();
    const { gameState, updateGameState } = useGame();
    const [bullets, setBullets] = useState([]);
    const [enemies, setEnemies] = useState([]);
    const playerRef = useRef();
    const lastSpawnTime = useRef(0);
    const spawnInterval = 1; // seconds

    const addBullet = useCallback((position) => {
        setBullets(prev => [...prev, { id: Date.now(), position, firedByPlayer: true, speed: 5 }]);
    }, []);
    
    const useBomb = () => {
        console.log("Bomb used!");
        setEnemies([]);
    };

    useEffect(() => {
        const handleDoubleClick = () => useBomb();
        window.addEventListener('dblclick', handleDoubleClick);
        return () => window.removeEventListener('dblclick', handleDoubleClick);
    }, []);


    useFrame((state, delta) => {
        if (gameState.currentScreen !== 'playing') return;

        // --- Update State ---
        let newBullets = [...bullets];
        let newEnemies = [...enemies];
        let newPlayerHealth = gameState.playerHealth;
        let scoreToAdd = 0;

        // Spawn Enemies
        if (state.clock.elapsedTime - lastSpawnTime.current > spawnInterval) {
            const enemyUfoOptions = ufos.filter(ufo => ufo.id !== gameState.selectedUFOId);
            const randomUfo = enemyUfoOptions[Math.floor(Math.random() * enemyUfoOptions.length)];
            newEnemies.push({
                id: Date.now(),
                position: [(Math.random() - 0.5) * (viewport.width - 2), viewport.height / 2 + 1, 0],
                ufoData: randomUfo,
                speed: 0.05,
                health: randomUfo.stats.health,
            });
            lastSpawnTime.current = state.clock.elapsedTime;
        }

        // Move Entities
        newBullets = newBullets.map(b => ({ ...b, position: [b.position[0], b.position[1] + b.speed * delta * 100, b.position[2]] }));
        newEnemies = newEnemies.map(e => ({ ...e, position: [e.position[0], e.position[1] - e.speed, e.position[2]] }));

        // --- Collision Detection ---
        const playerBox = playerRef.current ? new Box3().setFromObject(playerRef.current) : null;
        const bulletsToRemove = new Set();
        const enemiesToRemove = new Set();

        // Player / Enemy and Bullet / Enemy
        for (const enemy of newEnemies) {
            const enemyBox = new Box3().setFromCenterAndSize(new Vector3(...enemy.position), new Vector3(1, 1, 1));
            
            if (playerBox && playerBox.intersectsBox(enemyBox)) {
                enemiesToRemove.add(enemy.id);
                newPlayerHealth -= enemy.ufoData.stats.damage;
            }
            
            for (const bullet of newBullets) {
                if(bullet.firedByPlayer) {
                    const bulletBox = new Box3().setFromCenterAndSize(new Vector3(...bullet.position), new Vector3(0.2, 0.5, 0.1));
                    if (enemyBox.intersectsBox(bulletBox)) {
                        bulletsToRemove.add(bullet.id);
                        enemy.health -= 1;
                        if (enemy.health <= 0) {
                            enemiesToRemove.add(enemy.id);
                            scoreToAdd += 100;
                        }
                    }
                }
            }
        }
        
        // --- Finalize State Updates ---
        const finalEnemies = newEnemies.filter(e => !enemiesToRemove.has(e.id) && e.position[1] > -viewport.height / 2 - 5);
        const finalBullets = newBullets.filter(b => !bulletsToRemove.has(b.id) && b.position[1] < viewport.height / 2 + 1);

        setEnemies(finalEnemies);
        setBullets(finalBullets);

        if (scoreToAdd > 0 || newPlayerHealth < gameState.playerHealth) {
            updateGameState({
                score: gameState.score + scoreToAdd,
                playerHealth: newPlayerHealth
            });
        }
    });


    return (
        <>
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.8} />
            <pointLight position={[0, 0, 5]} intensity={0.5} />
            <Starfield />
            <PlayerShip ref={playerRef} onShoot={addBullet} />
            {bullets.map((bullet) => <Bullet key={bullet.id} {...bullet} />)}
            {enemies.map((enemy) => <EnemyShip key={enemy.id} {...enemy} />)}
        </>
    );
}

export default GameScene;
