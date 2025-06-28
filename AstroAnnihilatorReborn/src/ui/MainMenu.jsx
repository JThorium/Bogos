import React from 'react';

const MainMenu = ({ onStartGame, onShowOptions, onShowLeaderboard, onQuit }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-6xl font-extrabold mb-8 text-yellow-400 drop-shadow-lg">Astro Annihilator Reborn</h1>
      <div className="flex flex-col space-y-4 w-64">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg"
          onClick={onStartGame}
        >
          Start Game
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg"
          onClick={onShowOptions}
        >
          Options
        </button>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg"
          onClick={onShowLeaderboard}
        >
          Leaderboard
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg"
          onClick={onQuit}
        >
          Quit
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
