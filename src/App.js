import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import './styles/index.css';

// Game components (to be implemented)
const MainMenu = React.lazy(() => import('./components/MainMenu'));
const Game = React.lazy(() => import('./game/Game'));
const LoadingScreen = React.lazy(() => import('./components/LoadingScreen'));
const ControlsMenu = React.lazy(() => import('./components/ControlsMenu'));

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, loading, playing, controls
  const [playerName, setPlayerName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [controlsConfig, setControlsConfig] = useState({
    forward: 'w',
    left: 'a',
    backward: 's',
    right: 'd',
    jump: ' ', // space
    reload: 'r',
    pickup: 'e',
    crouch: 'c'
  });

  // Handle game state changes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && gameState === 'playing') {
        setGameState('menu');
      }
      if (e.key === 'Tab' && gameState === 'playing') {
        // Show scoreboard while Tab is pressed
        document.querySelector('.scoreboard').style.display = 'block';
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Tab' && gameState === 'playing') {
        // Hide scoreboard when Tab is released
        document.querySelector('.scoreboard').style.display = 'none';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Handle player joining game
  const handleJoinGame = (name, code = '') => {
    setPlayerName(name);
    setInviteCode(code);
    setGameState('loading');
    
    // Simulate loading time
    setTimeout(() => {
      setGameState('playing');
    }, 3000);
  };

  // Handle controls configuration
  const handleControlsChange = (newControls) => {
    setControlsConfig({...controlsConfig, ...newControls});
  };

  return (
    <div className="app">
      <Suspense fallback={<div>Loading...</div>}>
        {gameState === 'menu' && (
          <MainMenu 
            onJoinGame={handleJoinGame} 
            onOpenControls={() => setGameState('controls')}
          />
        )}
        
        {gameState === 'loading' && (
          <LoadingScreen />
        )}
        
        {gameState === 'controls' && (
          <ControlsMenu 
            controls={controlsConfig}
            onControlsChange={handleControlsChange}
            onBack={() => setGameState('menu')}
          />
        )}
        
        {gameState === 'playing' && (
          <>
            <Canvas shadows>
              <Sky sunPosition={[100, 20, 100]} />
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} castShadow />
              <Game 
                playerName={playerName}
                inviteCode={inviteCode}
                controls={controlsConfig}
              />
            </Canvas>
            
            {/* HUD and UI elements will be added here */}
            <div className="ui-layer">
              <div className="crosshair">+</div>
              <div className="hud">
                <div className="ammo-counter">30/90</div>
                <div className="health-bar">
                  <div className="health-bar-fill" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="game-timer">10:00</div>
              <div className="scoreboard">
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
                    {/* Scoreboard entries will be dynamically added */}
                  </tbody>
                </table>
              </div>
              <div className="game-end">
                <h2>Game Over</h2>
                <div className="top-players">
                  <div className="top-player first">
                    <h3>1st Place</h3>
                    <p>Player1 - 15 kills</p>
                  </div>
                  <div className="top-player second">
                    <h3>2nd Place</h3>
                    <p>Player2 - 12 kills</p>
                  </div>
                  <div className="top-player third">
                    <h3>3rd Place</h3>
                    <p>Player3 - 10 kills</p>
                  </div>
                </div>
                <p>Next match starting in 10 seconds...</p>
              </div>
            </div>
          </>
        )}
      </Suspense>
    </div>
  );
}

export default App;
