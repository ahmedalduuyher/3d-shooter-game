# 3D Pixel Shooter Game

A fully functional 3D web game using JavaScript and React. This game is a pixel 3D shooter game with mechanics similar to Counter-Strike, featuring a deathmatch game mode with red and blue teams.

## Features

- 3D pixel art style rendering
- Team-based deathmatch gameplay (red vs blue teams)
- Multiple weapons: AK-47, shotgun, sniper, SMG
- Two detailed maps: winter and grass environments
- Player controls: WASD movement, space for jump, C for crouch
- Weapon mechanics: left-click to shoot, right-click to scope, R to reload, E to pick up weapons
- Multiplayer with invite codes for friends to play together
- Scoreboard (Tab key) showing player stats
- 10-minute matches with map rotation
- Weapon drop on player death with 10-second despawn timer

## Game Controls

- W: Move forward
- A: Move left
- S: Move backward
- D: Move right
- Space: Jump
- C: Crouch
- R: Reload weapon
- E: Pick up weapon
- Left Mouse Button: Shoot
- Right Mouse Button: Scope/aim
- Tab: View scoreboard

## Project Structure

- `/public`: Static assets and HTML template
- `/src`: Source code
  - `/components`: React components for UI
  - `/game`: Game logic
    - `/maps`: Map components (winter and grass)
    - `/players`: Player mechanics and controls
    - `/weapons`: Weapon system and classes
    - `/multiplayer`: Multiplayer functionality
    - `/rendering`: 3D rendering and camera controls
- `/server`: Multiplayer server implementation

## Development

See the [DEPLOYMENT.md](DEPLOYMENT.md) file for detailed instructions on how to run and deploy the game.

## Technologies Used

- React for UI components
- Three.js for 3D rendering
- React Three Fiber for React integration with Three.js
- Socket.IO for multiplayer functionality
- Express for the backend server

## License

This game is provided for educational and personal use.
