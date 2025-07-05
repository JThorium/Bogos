import React, { useState } from 'react';
import { useGame } from '../game/GameProvider';

/**
 * OptionsMenu allows the player to tweak simple settings (volume, difficulty, etc.)
 * and provides a button to return to the Main Menu.
 */
function OptionsMenu({ onBack }) {
  const { gameState, updateGameState } = useGame();

  // Simple local state for the two options we expose. You can expand this later.
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('volume') ?? '1'));
  const [spawnMultiplier, setSpawnMultiplier] = useState(gameState.spawnMultiplier);
  const [fullscreen, setFullscreen] = useState(document.fullscreenElement != null);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    // Persist volume to localStorage so we remember it next time the game loads.
    localStorage.setItem('volume', val.toString());
  };

  const handleSpawnChange = (e) => {
    const val = parseInt(e.target.value);
    setSpawnMultiplier(val);
  };

  const handleSaveAndBack = () => {
    // Update global game state with the new spawn multiplier then go back.
    updateGameState({ spawnMultiplier });
    onBack();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreen(false);
    } else {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Options</h1>
      <div className="flex flex-col space-y-8 w-80">
        {/* Volume Slider */}
        <div>
          <label className="block mb-2 text-lg font-semibold">
            Master Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
          />
        </div>

        {/* Difficulty Slider */}
        <div>
          <label className="block mb-2 text-lg font-semibold">
            Enemy Spawn Multiplier: {spawnMultiplier}x
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={spawnMultiplier}
            onChange={handleSpawnChange}
            className="w-full"
          />
        </div>

        {/* Fullscreen Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Fullscreen</span>
          <button
            className={`py-1 px-3 rounded-lg font-bold ${fullscreen ? 'bg-green-600' : 'bg-gray-600'}`}
            onClick={toggleFullscreen}
          >
            {fullscreen ? 'ON' : 'OFF'}
          </button>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200"
          onClick={handleSaveAndBack}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default OptionsMenu; 