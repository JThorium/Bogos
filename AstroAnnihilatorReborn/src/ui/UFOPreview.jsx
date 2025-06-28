import React from 'react';
// import { Canvas } from '@react-three/fiber'; // Removed Canvas
// import { OrbitControls } from '@react-three/drei'; // Removed OrbitControls
// import GameEntity from '../game/entities/GameEntity'; // Removed GameEntity import for now

const UFOPreview = ({ ufoData }) => {
  if (!ufoData) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500">Select a UFO</div>;
  }

  // Placeholder for the 3D UFO preview
  return (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      {ufoData.name} Preview (3D Model will go here)
    </div>
  );
};

export default UFOPreview;
