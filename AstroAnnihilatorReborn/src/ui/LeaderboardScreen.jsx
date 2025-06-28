import React from 'react';

const LeaderboardScreen = ({ onBack }) => {
  // Dummy data for now
  const leaderboardData = [
    { name: 'Player1', score: 10000 },
    { name: 'Player2', score: 9000 },
    { name: 'Player3', score: 8000 },
    { name: 'Player4', score: 7000 },
    { name: 'Player5', score: 6000 },
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-green-400">Leaderboard</h1>
      <div className="w-80 bg-gray-800 p-4 rounded-lg shadow-lg">
        {leaderboardData.map((entry, index) => (
          <div key={index} className="flex justify-between py-2 border-b border-gray-700 last:border-b-0">
            <span className="text-lg">{index + 1}. {entry.name}</span>
            <span className="text-lg font-bold">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <button
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200 shadow-lg mt-8"
        onClick={onBack}
      >
        Back
      </button>
    </div>
  );
};

export default LeaderboardScreen;
