import React from 'react';

function PauseMenu({ onResume, onBackToMain }) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-8">Paused</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl mb-4"
        onClick={onResume}
      >
        Resume Game
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-xl"
        onClick={onBackToMain}
      >
        Back to Main Menu
      </button>
    </div>
  );
}

export default PauseMenu;
