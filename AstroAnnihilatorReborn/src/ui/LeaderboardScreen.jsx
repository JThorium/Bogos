import React, { useEffect, useState } from 'react';
import { useGame } from '../game/GameProvider';
import { fetchTopScores } from '../game/GameProvider';

/**
 * LeaderboardScreen shows top scores and allows user to go back.
 */
function LeaderboardScreen({ onBack }) {
  const { gameState } = useGame();
  const [scores, setScores] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const top = await fetchTopScores(10);
        if (mounted && top.length) {
          setScores(top);
          return;
        }
      } catch (e) {
        console.warn('Remote leaderboard unavailable, falling back to local', e);
      }
      // Local fallback
      const stored = JSON.parse(localStorage.getItem('leaderboard') || '[]');
      if (stored.length === 0 && gameState.highScore > 0) {
        stored.push({ displayName: 'YOU', score: gameState.highScore });
      }
      stored.sort((a, b) => b.score - a.score);
      if (mounted) setScores(stored.slice(0, 10));
    })();
    return () => (mounted = false);
  }, [gameState.highScore]);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-yellow-400 drop-shadow-lg">Leaderboard</h1>
      <table className="w-72 text-left text-lg mb-8">
        <thead>
          <tr className="text-indigo-400">
            <th className="py-1 px-2">#</th>
            <th className="py-1 px-2">Player</th>
            <th className="py-1 px-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-4 text-center text-gray-400">No scores yet</td>
            </tr>
          ) : (
            scores.map((s, idx) => (
              <tr key={idx} className="odd:bg-gray-800 even:bg-gray-700">
                <td className="py-1 px-2 font-mono">{idx + 1}</td>
                <td className="py-1 px-2 flex items-center space-x-2">
                  {s.avatarUrl ? (
                    <img src={s.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full border border-gray-500" />
                  ) : (
                    <span className="inline-block w-6 h-6 rounded-full bg-gray-600 text-center font-mono text-sm mr-1">
                      {(s.displayName || s.name || '???').slice(0, 3).toUpperCase()}
                    </span>
                  )}
                  <span>{s.displayName ?? s.name}</span>
                </td>
                <td className="py-1 px-2 text-right font-mono">{s.score.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors duration-200" onClick={onBack}>Back</button>
    </div>
  );
}

export default LeaderboardScreen; 