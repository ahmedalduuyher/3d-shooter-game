import React, { useState, useEffect } from 'react';

const LobbySystem = ({ playerName, onJoinGame, onCreateGame, onOpenControls }) => {
  const [name, setName] = useState(playerName || '');
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [generatedInviteCode, setGeneratedInviteCode] = useState('');
  const [availableGames, setAvailableGames] = useState([]);
  const [error, setError] = useState('');

  // Simulate fetching available games
  useEffect(() => {
    // In a real implementation, this would fetch from a server
    const simulatedGames = [
      { id: 'game1', name: 'Winter Deathmatch', players: 6, maxPlayers: 10, map: 'winter' },
      { id: 'game2', name: 'Grass Arena', players: 8, maxPlayers: 10, map: 'grass' },
      { id: 'game3', name: 'Sniper Battle', players: 4, maxPlayers: 10, map: 'winter' },
    ];
    
    setAvailableGames(simulatedGames);
  }, []);

  // Handle play button click
  const handlePlay = () => {
    if (name.trim() === '') {
      setError('Please enter your name');
      return;
    }
    
    setError('');
    
    if (showInviteInput && inviteCode.trim() === '') {
      setError('Please enter an invite code or cancel');
      return;
    }
    
    // Join game with or without invite code
    onJoinGame(name, showInviteInput ? inviteCode : '');
  };

  // Generate a new invite code
  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedInviteCode(code);
    
    // In a real implementation, this would create a new game on the server
    onCreateGame(name, code);
  };

  // Join a specific game from the list
  const joinGame = (gameId) => {
    if (name.trim() === '') {
      setError('Please enter your name first');
      return;
    }
    
    setError('');
    onJoinGame(name, gameId);
  };

  return (
    <div className="lobby-system">
      <div className="menu">
        <h1>3D Pixel Shooter</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        
        <div className="button-group">
          <button onClick={handlePlay}>Play</button>
          <button onClick={onOpenControls}>Controls</button>
          
          {!generatedInviteCode ? (
            <>
              <button onClick={() => setShowInviteInput(!showInviteInput)}>
                {showInviteInput ? 'Cancel' : 'Join with Code'}
              </button>
              <button onClick={generateInviteCode}>Create Game</button>
            </>
          ) : (
            <button onClick={() => setGeneratedInviteCode('')}>Cancel Game</button>
          )}
        </div>
        
        {!showInviteInput && !generatedInviteCode && (
          <div className="available-games">
            <h2>Available Games</h2>
            <div className="game-list">
              {availableGames.map(game => (
                <div key={game.id} className="game-item">
                  <div className="game-info">
                    <span className="game-name">{game.name}</span>
                    <span className="game-players">{game.players}/{game.maxPlayers} players</span>
                    <span className="game-map">Map: {game.map}</span>
                  </div>
                  <button onClick={() => joinGame(game.id)}>Join</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbySystem;
