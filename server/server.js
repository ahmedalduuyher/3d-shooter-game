const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../build')));

// Game state
const games = {};
const players = {};

// Create a new game
const createGame = (gameId, mapName = 'winter') => {
  games[gameId] = {
    id: gameId,
    players: [],
    teams: {
      red: [],
      blue: []
    },
    scores: {},
    mapName,
    timeRemaining: 600, // 10 minutes
    active: true
  };
  
  return games[gameId];
};

// Add player to game
const addPlayerToGame = (gameId, player) => {
  if (!games[gameId]) {
    createGame(gameId);
  }
  
  const game = games[gameId];
  
  // Determine team (balance teams)
  const team = game.teams.red.length <= game.teams.blue.length ? 'red' : 'blue';
  
  // Add player to game
  game.players.push(player.id);
  game.teams[team].push(player.id);
  game.scores[player.id] = { kills: 0, deaths: 0 };
  
  // Update player record
  players[player.id] = {
    ...player,
    gameId,
    team
  };
  
  return team;
};

// Remove player from game
const removePlayerFromGame = (playerId) => {
  const player = players[playerId];
  if (!player || !player.gameId) return;
  
  const game = games[player.gameId];
  if (!game) return;
  
  // Remove from game
  game.players = game.players.filter(id => id !== playerId);
  game.teams[player.team] = game.teams[player.team].filter(id => id !== playerId);
  delete game.scores[playerId];
  
  // Remove player record
  delete players[playerId];
  
  // Clean up empty games
  if (game.players.length === 0) {
    delete games[player.gameId];
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Join game
  socket.on('join_game', (data) => {
    const { playerName, inviteCode } = data;
    
    // Create player object
    const player = {
      id: socket.id,
      name: playerName,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      health: 100,
      weapon: 'AK-47'
    };
    
    // Determine game to join
    let gameId = inviteCode;
    
    if (!gameId) {
      // Find a game with space or create a new one
      const availableGame = Object.values(games).find(g => 
        g.active && g.players.length < 10
      );
      
      gameId = availableGame ? availableGame.id : `game_${Date.now()}`;
    }
    
    // Add player to game
    const team = addPlayerToGame(gameId, player);
    
    // Join socket room for the game
    socket.join(gameId);
    
    // Notify player of successful join
    socket.emit('game_joined', {
      gameId,
      team,
      players: Object.values(players).filter(p => p.gameId === gameId),
      game: games[gameId]
    });
    
    // Notify other players
    socket.to(gameId).emit('player_joined', {
      ...player,
      team
    });
    
    console.log(`Player ${playerName} joined game ${gameId} on team ${team}`);
  });
  
  // Player position update
  socket.on('update_position', (data) => {
    const player = players[socket.id];
    if (!player || !player.gameId) return;
    
    // Update player position
    player.position = data.position;
    player.rotation = data.rotation;
    
    // Broadcast to other players in the game
    socket.to(player.gameId).emit('player_moved', {
      id: socket.id,
      position: data.position,
      rotation: data.rotation
    });
  });
  
  // Player shooting
  socket.on('player_shoot', (data) => {
    const player = players[socket.id];
    if (!player || !player.gameId) return;
    
    // Broadcast shot to other players
    socket.to(player.gameId).emit('player_shot', {
      id: socket.id,
      weaponType: data.weaponType,
      position: data.position,
      direction: data.direction
    });
  });
  
  // Player hit
  socket.on('player_hit', (data) => {
    const { targetId, damage } = data;
    const player = players[socket.id];
    const target = players[targetId];
    
    if (!player || !target || player.gameId !== target.gameId) return;
    
    // Update target health
    target.health -= damage;
    
    // Check if target died
    if (target.health <= 0) {
      // Reset health
      target.health = 100;
      
      // Update scores
      const game = games[player.gameId];
      if (game) {
        game.scores[socket.id].kills++;
        game.scores[targetId].deaths++;
      }
      
      // Notify all players in the game
      io.to(player.gameId).emit('player_killed', {
        killerId: socket.id,
        targetId,
        killerName: player.name,
        targetName: target.name,
        weapon: player.weapon
      });
      
      // Respawn target
      setTimeout(() => {
        // Generate random spawn position based on team
        const spawnPoints = target.team === 'red' ? 
          [[-20, 1, -20], [-18, 1, -18], [-22, 1, -18]] : 
          [[20, 1, 20], [18, 1, 18], [22, 1, 18]];
        
        const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        
        // Update target position
        target.position = spawnPoint;
        
        // Notify target of respawn
        io.to(targetId).emit('player_respawn', {
          position: spawnPoint,
          health: 100
        });
      }, 3000); // 3 second respawn time
    } else {
      // Notify target of damage
      io.to(targetId).emit('player_damaged', {
        attackerId: socket.id,
        damage,
        health: target.health
      });
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove from game
    removePlayerFromGame(socket.id);
  });
});

// Game timer loop
const gameLoop = () => {
  Object.values(games).forEach(game => {
    if (!game.active) return;
    
    // Update game time
    game.timeRemaining--;
    
    // Check if game ended
    if (game.timeRemaining <= 0) {
      // End game
      game.active = false;
      
      // Notify all players
      io.to(game.id).emit('game_ended', {
        scores: game.scores,
        teams: game.teams
      });
      
      // Start new game after 10 seconds
      setTimeout(() => {
        // Switch map
        const newMap = game.mapName === 'winter' ? 'grass' : 'winter';
        
        // Reset game
        game.mapName = newMap;
        game.timeRemaining = 600;
        game.active = true;
        
        // Reset scores
        Object.keys(game.scores).forEach(playerId => {
          game.scores[playerId] = { kills: 0, deaths: 0 };
        });
        
        // Notify all players
        io.to(game.id).emit('new_game', {
          mapName: newMap,
          scores: game.scores
        });
      }, 10000); // 10 seconds between games
    }
    
    // Send time update every 5 seconds
    if (game.timeRemaining % 5 === 0) {
      io.to(game.id).emit('time_update', {
        timeRemaining: game.timeRemaining
      });
    }
  });
};

// Start game loop
setInterval(gameLoop, 1000);

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
