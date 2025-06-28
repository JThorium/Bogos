import React from 'react';

const OptionsMenu = ({ onBack }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Options</h1>
      <div className="flex flex-col space-y-4 w-64">
        {/* Placeholder for options settings */}
        <p className="text-lg">Volume: 50%</p>
        <p className="text-lg">Graphics: High</p>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg mt-4"
          onClick={onBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default OptionsMenu;
