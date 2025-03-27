import React, { useState, useEffect } from 'react';

const ScoreboardSystem = ({ players, scores, gameTime }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [topPlayers, setTopPlayers] = useState([]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update top players when scores change
  useEffect(() => {
    if (!scores) return;
    
    // Sort players by kills
    const sortedPlayers = Object.entries(scores)
      .sort((a, b) => b[1].kills - a[1].kills)
      .slice(0, 3); // Get top 3
    
    setTopPlayers(sortedPlayers);
  }, [scores]);
  
  // Handle Tab key for scoreboard visibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsVisible(true);
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Tab') {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Render game end screen with top players
  const renderGameEnd = () => {
    return (
      <div className="game-end" style={{ display: gameTime <= 0 ? 'block' : 'none' }}>
        <h2>Game Over</h2>
        <div className="top-players">
          {topPlayers.map((player, index) => {
            const [name, score] = player;
            const classes = ['top-player'];
            
            if (index === 0) classes.push('first');
            else if (index === 1) classes.push('second');
            else if (index === 2) classes.push('third');
            
            return (
              <div key={name} className={classes.join(' ')}>
                <h3>{index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} Place</h3>
                <p>{name} - {score.kills} kills</p>
              </div>
            );
          })}
        </div>
        <p>Next match starting in 10 seconds...</p>
      </div>
    );
  };
  
  // Find team for a player
  const getPlayerTeam = (playerName) => {
    const player = players.find(p => p.name === playerName);
    return player ? player.team : '';
  };
  
  return (
    <>
      <div className="scoreboard" style={{ display: isVisible ? 'block' : 'none' }}>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th>Kills</th>
              <th>Deaths</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(scores || {}).map(([playerName, score]) => (
              <tr key={playerName} className={`team-${getPlayerTeam(playerName)}`}>
                <td>{playerName}</td>
                <td>{getPlayerTeam(playerName)}</td>
                <td>{score.kills}</td>
                <td>{score.deaths}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="game-timer">
        {formatTime(gameTime)}
      </div>
      
      {renderGameEnd()}
    </>
  );
};

export default ScoreboardSystem;
