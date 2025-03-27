# 3D Pixel Shooter Game - Deployment Instructions

## Overview
This document provides instructions for deploying the 3D Pixel Shooter Game, a multiplayer first-person shooter with team-based deathmatch gameplay.

## Prerequisites
- Node.js 14+ and npm
- A server with Node.js support for hosting the multiplayer functionality
- Basic knowledge of terminal/command line operations

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```
This will start both the React frontend and the multiplayer server.

3. Open your browser and navigate to `http://localhost:3000`

## Building for Production

1. Create an optimized production build:
```bash
npm run build
```

2. The build files will be created in the `build` directory.

## Deployment Options

### Option 1: Deploy to a Node.js Server

1. Transfer the entire project directory to your server.

2. Install production dependencies:
```bash
npm install --production
```

3. Start the server:
```bash
npm run server
```

4. The game will be available at `http://your-server-address:3001`

### Option 2: Deploy Frontend and Backend Separately

#### Frontend Deployment (Static Files)
1. Deploy the contents of the `build` directory to any static file hosting service (Netlify, Vercel, GitHub Pages, etc.).

2. Make sure to update the Socket.IO connection URL in `src/game/multiplayer/MultiplayerManager.js` to point to your backend server.

#### Backend Deployment
1. Deploy the `server` directory to a Node.js hosting service (Heroku, DigitalOcean, AWS, etc.).

2. Set the PORT environment variable if needed.

3. Start the server using:
```bash
node server/server.js
```

## Game Features

- Team-based deathmatch (red vs blue teams)
- Multiple weapons: AK-47, shotgun, sniper, SMG
- Two maps: winter and grass environments
- Player controls: WASD movement, space for jump, C for crouch
- Weapon mechanics: left-click to shoot, right-click to scope, R to reload, E to pick up weapons
- Multiplayer with invite codes for friends to play together
- Scoreboard (Tab key) showing player stats
- 10-minute matches with map rotation

## Customization

- Add new maps by creating new map components in `src/game/maps/`
- Add new weapons by extending the weapon classes in `src/game/weapons/Weapon.js`
- Modify game settings in `server/server.js`

## Troubleshooting

- If you encounter CORS issues, make sure the frontend is connecting to the correct backend URL
- For multiplayer issues, check the server logs for connection problems
- Performance issues may require adjusting the rendering settings in `src/game/rendering/PixelRenderer.js`

## License
This game is provided for educational and personal use.
