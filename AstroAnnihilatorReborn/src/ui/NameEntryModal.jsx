import React, { useState } from 'react';

function NameEntryModal({ user, onSubmit, onCancel }) {
  const [letters, setLetters] = useState('');
  const [useGoogle, setUseGoogle] = useState(true);

  const handleLettersChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    setLetters(val);
    setUseGoogle(false);
  };

  const handleUseGoogle = () => {
    setUseGoogle(true);
    setLetters('');
  };

  const handleSubmit = () => {
    if (useGoogle && user?.displayName) {
      onSubmit(user.displayName);
    } else if (letters.length === 3) {
      onSubmit(letters);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">New High Score!</h2>
        <p className="mb-2">Enter 3 letters or use your Google name:</p>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={letters}
            onChange={handleLettersChange}
            maxLength={3}
            className="text-black text-2xl font-mono w-20 text-center rounded p-2"
            placeholder="ABC"
            disabled={useGoogle}
          />
          <button
            className={`py-2 px-3 rounded-lg font-bold ${useGoogle ? 'bg-green-600' : 'bg-gray-600'}`}
            onClick={handleUseGoogle}
            disabled={!user?.displayName}
          >
            Use Google Name
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={handleSubmit}
            disabled={(!useGoogle && letters.length !== 3) && !user?.displayName}
          >
            Submit
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default NameEntryModal; 