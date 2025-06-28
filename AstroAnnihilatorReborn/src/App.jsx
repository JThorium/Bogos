import React from 'react';
import { Canvas } from '@react-three/fiber';
import MainMenu from './ui/MainMenu';
import OptionsMenu from './ui/OptionsMenu';
import LeaderboardScreen from './ui/LeaderboardScreen';
import { useGame } from './game/GameProvider';
import GameScene from './game/GameScene';
import CameraRig from './game/CameraRig'; // Import CameraRig component

function App() {
  const { gameState, updateGameState } = useGame();
  const { currentScreen, score } = gameState;

  const handleStartGame = () => updateGameState({ currentScreen: 'playing' });
  const handleShowOptions = () => updateGameState({ currentScreen: 'options' });
  const handleShowLeaderboard = () => updateGameState({ currentScreen: 'leaderboard' });
  const handleQuit = () => alert('Quitting game...'); // Simple alert for now
  const handleBackToMain = () => updateGameState({ currentScreen: 'mainMenu' });

  return (
    <div className="w-screen h-screen">
      <Canvas style={{ background: 'black' }}> {/* Removed camera prop, CameraRig will handle it */}
        {/* Render GameScene only when currentScreen is 'playing' */}
        {currentScreen === 'playing' && <GameScene />}
        <CameraRig /> {/* CameraRig will set the camera position */}
      </Canvas>

      {/* UI Overlay */}
      {currentScreen === 'mainMenu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onShowOptions={handleShowOptions}
          onShowLeaderboard={handleShowLeaderboard}
          onQuit={handleQuit}
        />
      )}
      {currentScreen === 'playing' && (
        <div className="absolute top-4 left-4 text-white text-2xl font-bold">
          Score: {score}
        </div>
      )}
      {currentScreen === 'options' && <OptionsMenu onBack={handleBackToMain} />}
      {currentScreen === 'leaderboard' && <LeaderboardScreen onBack={handleBackToMain} />}
    </div>
  );
}

export default App;
