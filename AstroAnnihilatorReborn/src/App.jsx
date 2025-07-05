import React, { useEffect } from 'react'; // Import useEffect
import { Canvas } from '@react-three/fiber';
import MainMenu from './ui/MainMenu';
import OptionsMenu from './ui/OptionsMenu';
import LeaderboardScreen from './ui/LeaderboardScreen';
import HangarScreen from './ui/HangarScreen';
import GameOverScreen from './ui/GameOverScreen';
import PauseMenu from './ui/PauseMenu'; // Import PauseMenu
import { useGame } from './game/GameProvider';
import GameScene from './game/GameScene';
import CameraRig from './game/CameraRig';
import Starfield from './game/Starfield';
import * as THREE from 'three';
import ErrorBoundary from './ErrorBoundary'; // Import ErrorBoundary
import DevMenu from './ui/DevMenu';
import NameEntryModal from './ui/NameEntryModal';

function App() {
  const { gameState, updateGameState, user, postScore } = useGame();
  const { currentScreen, score, playerHealth } = gameState;
  const [showNameModal, setShowNameModal] = React.useState(false);
  const [scoreSubmitted, setScoreSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (currentScreen === 'gameOver' && score > 0 && !scoreSubmitted) {
      setShowNameModal(true);
    } else {
      setShowNameModal(false);
    }
  }, [currentScreen, score, scoreSubmitted]);

  const handleSubmitName = async (name) => {
    if (user && user.uid) {
      await postScore(user.uid, name, score, user.photoURL);
    } else {
      // Save to local leaderboard
      const stored = JSON.parse(localStorage.getItem('leaderboard') || '[]');
      stored.push({ displayName: name, score });
      stored.sort((a, b) => b.score - a.score);
      localStorage.setItem('leaderboard', JSON.stringify(stored.slice(0, 10)));
    }
    setScoreSubmitted(true);
    setShowNameModal(false);
  };

  const handleCancelName = () => {
    setScoreSubmitted(true);
    setShowNameModal(false);
  };

  const handleStartGame = () => updateGameState({ currentScreen: 'playing', score: 0 }); // Reset on start
  const handleShowOptions = () => updateGameState({ currentScreen: 'options' });
  const handleShowLeaderboard = () => updateGameState({ currentScreen: 'leaderboard' });
  const handleShowHangar = () => updateGameState({ currentScreen: 'hangar' });
  const handleQuit = () => alert('Quitting game...');
  const handleBackToMain = () => updateGameState({ currentScreen: 'mainMenu' });
  const handleRestartGame = () => updateGameState({ currentScreen: 'playing', score: 0 }); // Restart

  const handleResumeGame = () => updateGameState({ currentScreen: 'playing' });

  const handleShowDev = () => updateGameState({ currentScreen: 'devMenu' });

  // Game Over logic is now handled in GameScene.jsx useEffect
  // Pause logic is now handled in GameScene.jsx useEffect

  return (
    <ErrorBoundary>
      <div className="w-screen h-screen">
        <Canvas camera={{ position: [0, 0, 10], fov: 90 }} style={{ background: 'black' }}>
          <Starfield />
          {currentScreen === 'playing' && <GameScene />}
          <CameraRig />
        </Canvas>

        {/* UI Overlay */}
        {currentScreen === 'mainMenu' && (
          <MainMenu
            onStartGame={() => { setScoreSubmitted(false); handleStartGame(); }}
            onShowOptions={handleShowOptions}
            onShowLeaderboard={handleShowLeaderboard}
            onQuit={handleQuit}
            onShowHangar={handleShowHangar}
            onShowDev={handleShowDev}
          />
        )}
        {currentScreen === 'playing' && (
          <div className="absolute top-4 left-4 text-white text-2xl font-bold">
            Score: {score} | Health: {playerHealth}
          </div>
        )}
        {currentScreen === 'options' && <OptionsMenu onBack={handleBackToMain} />}
        {currentScreen === 'leaderboard' && <LeaderboardScreen onBack={handleBackToMain} />}
        {currentScreen === 'hangar' && <HangarScreen onBack={handleBackToMain} />}
        {showNameModal && (
          <NameEntryModal
            user={user}
            onSubmit={handleSubmitName}
            onCancel={handleCancelName}
          />
        )}
        {currentScreen === 'gameOver' && !showNameModal && (
          <GameOverScreen onRestart={() => {
            setScoreSubmitted(false);
            updateGameState({ currentScreen: 'playing', score: 0 });
          }} />
        )}
        {currentScreen === 'paused' && <PauseMenu onResume={handleResumeGame} onBackToMain={handleBackToMain} />}
        {currentScreen === 'devMenu' && <DevMenu onBack={handleBackToMain} />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
