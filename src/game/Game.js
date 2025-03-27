import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';

// Import rendering components
import PixelRenderer from './rendering/PixelRenderer';
import CameraController from './rendering/CameraController';
import LightingSetup from './rendering/LightingSetup';
// Game components
import Player from './players/Player';
import Map from './maps/Map';
import WeaponSystem from './weapons/WeaponSystem';
import MultiplayerManager from './multiplayer/MultiplayerManager';

const Game = ({ playerName, inviteCode, controls }) => {
  // Player reference for camera following
  const playerRef = useRef();
  
  const [gameState, setGameState] = useState({
    players: [],
    currentMap: 'winter', // Default map
    timeRemaining: 600, // 10 minutes in seconds
    teams: {
      red: [],
      blue: []
    },
    weapons: [],
    scores: {}
  });

  // Initialize game
  useEffect(() => {
    // Initialize multiplayer connection
    console.log(`Player ${playerName} joining game with invite code: ${inviteCode || 'none'}`);
    
    // Set up game timer
    const timerInterval = setInterval(() => {
      setGameState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        
        // Check if game is over
        if (newTimeRemaining <= 0) {
          clearInterval(timerInterval);
          endGame();
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining
        };
      });
    }, 1000);
    
    // Update UI timer
    const updateUITimer = () => {
      const minutes = Math.floor(gameState.timeRemaining / 60);
      const seconds = gameState.timeRemaining % 60;
      const timerElement = document.querySelector('.game-timer');
      if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    };
    
    const uiInterval = setInterval(updateUITimer, 1000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(timerInterval);
      clearInterval(uiInterval);
    };
  }, [playerName, inviteCode]);
  
  // End game and show results
  const endGame = () => {
    // Sort players by kills
    const sortedPlayers = Object.entries(gameState.scores)
      .sort((a, b) => b[1].kills - a[1].kills)
      .slice(0, 3); // Get top 3
    
    // Update UI
    const gameEndElement = document.querySelector('.game-end');
    if (gameEndElement) {
      gameEndElement.style.display = 'block';
      
      // Update top players
      const topPlayerElements = gameEndElement.querySelectorAll('.top-player');
      sortedPlayers.forEach((player, index) => {
        if (topPlayerElements[index]) {
          const [name, score] = player;
          topPlayerElements[index].querySelector('p').textContent = `${name} - ${score.kills} kills`;
        }
      });
      
      // Restart game after 10 seconds
      setTimeout(() => {
        gameEndElement.style.display = 'none';
        // Reset game state with new map
        setGameState(prev => ({
          ...prev,
          currentMap: prev.currentMap === 'winter' ? 'grass' : 'winter',
          timeRemaining: 600
        }));
      }, 10000);
    }
  };

  // Handle multiplayer events
  const handlePlayerJoin = (player) => {
    console.log(`Player joined: ${player.name}`);
    // Add player to game state
  };

  const handlePlayerLeave = (player) => {
    console.log(`Player left: ${player.name}`);
    // Remove player from game state
  };

  const handleGameStateUpdate = (newState) => {
    console.log('Game state updated:', newState);
    setGameState(prev => ({
      ...prev,
      players: newState.players || prev.players,
      teams: newState.teams || prev.teams
    }));
  };

  return (
    <>
      {/* Rendering setup */}
      <LightingSetup />
      <CameraController playerRef={playerRef} />
      <PixelRenderer />
      
      {/* Physics world */}
      <Physics>
        {/* Current map */}
        <Map mapName={gameState.currentMap} />
        
        {/* Player */}
        <Player 
          ref={playerRef}
          name={playerName}
          team={gameState.teams.red?.includes(playerName) ? 'red' : 'blue'}
          position={[0, 1, 0]}
          controls={controls}
        />
        
        {/* Weapon system */}
        <WeaponSystem player={playerRef} />
        
        {/* Multiplayer manager (non-visual component) */}
        <MultiplayerManager
          playerName={playerName}
          inviteCode={inviteCode}
          onPlayerJoin={handlePlayerJoin}
          onPlayerLeave={handlePlayerLeave}
          onGameStateUpdate={handleGameStateUpdate}
        />
      </Physics>
    </>
  );
};

export default Game;
