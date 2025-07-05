import React, { useState } from 'react';
import { useGame } from '../game/GameProvider';

function DevMenu({ onBack }) {
  const { updateGameState } = useGame();
  const [score, setScore] = useState('');
  const [credits, setCredits] = useState('');
  const [materials, setMaterials] = useState('');

  const setValue = (field, val) => {
    const n = parseInt(val || '0');
    updateGameState({ [field]: isNaN(n) ? 0 : n });
  };

  const unlockAll = () => {
    updateGameState((prev) => ({
      unlockedUFOIds: new Set(prev.unlockedUFOIds).add(...prev.unlockedUFOIds, 'interceptor', ...prev.unlockedUFOIds),
      playerBombs: 99,
      playerShield: 99,
      highScore: 999999,
      starCredits: 999999,
    }));
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white p-4 space-y-4">
      <h1 className="text-4xl font-bold">Dev Menu</h1>
      <div className="space-y-2">
        <input value={score} onChange={(e)=>setScore(e.target.value)} placeholder="Set Score" className="text-black p-2"/>
        <button onClick={()=>{setValue('highScore',score);}}>Set</button>
      </div>
      <div className="space-y-2">
        <input value={credits} onChange={(e)=>setCredits(e.target.value)} placeholder="Set Star Credits" className="text-black p-2"/>
        <button onClick={()=>{setValue('starCredits',credits);}}>Set</button>
      </div>
      <div className="space-y-2">
        <input value={materials} onChange={(e)=>setMaterials(e.target.value)} placeholder="Set Materials" className="text-black p-2"/>
        <button onClick={()=>{setValue('rawMaterials',materials);}}>Set</button>
      </div>
      <button className="bg-green-600 p-2" onClick={unlockAll}>Unlock / Max All</button>
      <button className="bg-gray-600 p-2" onClick={onBack}>Back</button>
    </div>
  );
}
export default DevMenu; 