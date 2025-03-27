import React, { useState } from 'react';

const MainMenu = ({ onJoinGame, onOpenControls }) => {
  const [playerName, setPlayerName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [generatedInviteCode, setGeneratedInviteCode] = useState('');

  const handlePlay = () => {
    if (playerName.trim() === '') {
      alert('Please enter your name');
      return;
    }
    
    onJoinGame(playerName, inviteCode);
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedInviteCode(code);
  };

  return (
    <div className="menu">
      <h1>3D Pixel Shooter</h1>
      
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        maxLength={15}
      />
      
      {showInviteInput ? (
        <input
          type="text"
          placeholder="Enter invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          maxLength={6}
        />
      ) : generatedInviteCode ? (
        <div>
          <p>Share this code with friends:</p>
          <div className="invite-code">{generatedInviteCode}</div>
        </div>
      ) : null}
      
      <div>
        <button onClick={handlePlay}>Play</button>
        <button onClick={onOpenControls}>Controls</button>
        
        {!generatedInviteCode ? (
          <>
            <button onClick={() => setShowInviteInput(!showInviteInput)}>
              {showInviteInput ? 'Cancel' : 'Join with Code'}
            </button>
            <button onClick={generateInviteCode}>Generate Invite Code</button>
          </>
        ) : (
          <button onClick={() => setGeneratedInviteCode('')}>Cancel Invite</button>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
