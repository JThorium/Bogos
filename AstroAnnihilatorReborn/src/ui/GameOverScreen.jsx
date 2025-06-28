import React from 'react';

const GameOverScreen = ({ onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-6xl font-extrabold mb-8 text-red-500 drop-shadow-lg">GAME OVER!</h1>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg"
        onClick={onRestart}
      >
        Restart Game
      </button>
    </div>
  );
};

export default GameOverScreen;
