import React from 'react';
import { Canvas } from '@react-three/fiber';
import MainMenu from './ui/MainMenu';
import OptionsMenu from './ui/OptionsMenu';
import LeaderboardScreen from './ui/LeaderboardScreen';
import HangarScreen from './ui/HangarScreen'; // Import HangarScreen
import { useGame } from './game/GameProvider';
import GameScene from './game/GameScene';
import CameraRig from './game/CameraRig';
import Starfield from './game/Starfield';
import * as THREE from 'three';

function App() {
  const { gameState, updateGameState } = useGame();
  const { currentScreen, score } = gameState;

  const handleStartGame = () => updateGameState({ currentScreen: 'playing' });
  const handleShowOptions = () => updateGameState({ currentScreen: 'options' });
  const handleShowLeaderboard = () => updateGameState({ currentScreen: 'leaderboard' });
  const handleShowHangar = () => updateGameState({ currentScreen: 'hangar' }); // New handler for Hangar
  const handleQuit = () => alert('Quitting game...'); // Simple alert for now
  const handleBackToMain = () => updateGameState({ currentScreen: 'mainMenu' });

  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [0, 0, 10], fov: 90 }} style={{ background: 'black' }}>
        <Starfield /> {/* Render Starfield unconditionally */}
        {/* Render GameScene only when currentScreen is 'playing' */}
        {currentScreen === 'playing' && <GameScene />}
        <CameraRig /> {/* CameraRig will ensure camera looks at origin */}
      </Canvas>

      {/* UI Overlay */}
      {currentScreen === 'mainMenu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onShowOptions={handleShowOptions}
          onShowLeaderboard={handleShowLeaderboard}
          onQuit={handleQuit}
          onShowHangar={handleShowHangar} // Pass hangar handler
        />
      )}
      {currentScreen === 'playing' && (
        <div className="absolute top-4 left-4 text-white text-2xl font-bold">
          Score: {score}
        </div>
      )}
      {currentScreen === 'options' && <OptionsMenu onBack={handleBackToMain} />}
      {currentScreen === 'leaderboard' && <LeaderboardScreen onBack={handleBackToMain} />}
      {currentScreen === 'hangar' && <HangarScreen onBack={handleBackToMain} />} {/* Render HangarScreen */}
    </div>
  );
}

export default App;
