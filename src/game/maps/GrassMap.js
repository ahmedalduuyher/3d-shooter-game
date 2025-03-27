import React from 'react';
import { useBox, useCylinder, useSphere } from '@react-three/cannon';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import THREE from '../utils/ThreeShims';


// This is an enhanced version of the grass map with more detailed features
const GrassMap = () => {
  // Create spawn points for players
  const spawnPoints = [
    // Red team spawn points
    { position: [-20, 1, -20], team: 'red' },
    { position: [-18, 1, -18], team: 'red' },
    { position: [-22, 1, -18], team: 'red' },
    { position: [-18, 1, -22], team: 'red' },
    { position: [-22, 1, -22], team: 'red' },
    
    // Blue team spawn points
    { position: [20, 1, 20], team: 'blue' },
    { position: [18, 1, 18], team: 'blue' },
    { position: [22, 1, 18], team: 'blue' },
    { position: [18, 1, 22], team: 'blue' },
    { position: [22, 1, 22], team: 'blue' },
  ];

  // Create physics bodies for various map elements
  const [groundRef] = useBox(() => ({
    args: [100, 1, 100],
    position: [0, -0.5, 0],
    type: 'Static',
    material: { friction: 0.3 }
  }));

  // Trees
  const createTree = (position, type = 'normal') => {
    const [trunkRef] = useCylinder(() => ({
      args: [0.5, 0.5, 4, 8],
      position: [position[0], position[1] + 2, position[2]],
      rotation: [Math.PI / 2, 0, 0],
      type: 'Static',
    }));

    return (
      <group key={`tree-${position.join('-')}`}>
        {/* Tree trunk */}
        <mesh ref={trunkRef} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 4, 8]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        
        {/* Tree top - different shapes based on type */}
        {type === 'normal' && (
          <mesh position={[position[0], position[1] + 4.5, position[2]]} castShadow>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial color="#33691e" />
          </mesh>
        )}
        
        {type === 'pine' && (
          <mesh position={[position[0], position[1] + 4.5, position[2]]} castShadow>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#2e7d32" />
          </mesh>
        )}
        
        {type === 'wide' && (
          <mesh position={[position[0], position[1] + 4, position[2]]} castShadow>
            <cylinderGeometry args={[3, 1, 2, 8]} />
            <meshStandardMaterial color="#388e3c" />
          </mesh>
        )}
      </group>
    );
  };

  // Hills
  const createHill = (position, size) => {
    const [hillRef] = useSphere(() => ({
      args: [size],
      position: [position[0], position[1] - size/2 + 0.5, position[2]],
      type: 'Static',
    }));

    return (
      <mesh ref={hillRef} castShadow receiveShadow key={`hill-${position.join('-')}`}>
        <sphereGeometry args={[size, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8bc34a" />
      </mesh>
    );
  };

  // Rocks and boulders
  const createRock = (position, size) => {
    const [rockRef] = useBox(() => ({
      args: [size[0], size[1], size[2]],
      position: [position[0], position[1] + size[1]/2, position[2]],
      type: 'Static',
    }));

    return (
      <mesh ref={rockRef} castShadow receiveShadow key={`rock-${position.join('-')}`}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color="#757575" />
      </mesh>
    );
  };

  // Walls and barriers
  const createWall = (position, size, rotation = [0, 0, 0], color = "#8d6e63") => {
    const [wallRef] = useBox(() => ({
      args: [size[0], size[1], size[2]],
      position,
      rotation,
      type: 'Static',
    }));

    return (
      <mesh ref={wallRef} castShadow receiveShadow key={`wall-${position.join('-')}`}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  };

  // Wooden cabin
  const createCabin = (position) => {
    return (
      <group key={`cabin-${position.join('-')}`} position={[position[0], position[1], position[2]]}>
        {/* Base */}
        {createWall([0, 1.5, 0], [6, 3, 6], [0, 0, 0], "#a1887f")}
        
        {/* Roof */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <coneGeometry args={[4.5, 2, 4, 1]} rotation={[0, Math.PI/4, 0]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        
        {/* Door */}
        {createWall([0, 1, 3.01], [1.5, 2, 0.1], [0, 0, 0], "#4e342e")}
        
        {/* Windows */}
        {createWall([2, 1.5, 3.01], [1, 1, 0.1], [0, 0, 0], "#bbdefb")}
        {createWall([-2, 1.5, 3.01], [1, 1, 0.1], [0, 0, 0], "#bbdefb")}
      </group>
    );
  };

  // Tunnel
  const createTunnel = (position, length, rotation = 0) => {
    const tunnelWidth = 3;
    const tunnelHeight = 3;
    const wallThickness = 0.5;
    
    const rotationY = rotation * Math.PI / 180;
    
    // Create tunnel walls
    const leftWall = createWall(
      [
        position[0] + Math.sin(rotationY) * tunnelWidth/2,
        position[1] + tunnelHeight/2,
        position[2] + Math.cos(rotationY) * tunnelWidth/2
      ],
      [length, tunnelHeight, wallThickness],
      [0, rotationY, 0],
      "#689f38"
    );
    
    const rightWall = createWall(
      [
        position[0] - Math.sin(rotationY) * tunnelWidth/2,
        position[1] + tunnelHeight/2,
        position[2] - Math.cos(rotationY) * tunnelWidth/2
      ],
      [length, tunnelHeight, wallThickness],
      [0, rotationY, 0],
      "#689f38"
    );
    
    const ceiling = createWall(
      [
        position[0],
        position[1] + tunnelHeight,
        position[2]
      ],
      [length, wallThickness, tunnelWidth],
      [0, rotationY, 0],
      "#689f38"
    );
    
    return (
      <group key={`tunnel-${position.join('-')}`}>
        {leftWall}
        {rightWall}
        {ceiling}
      </group>
    );
  };

  // Small pond
  const createPond = (position, radius) => {
    const segments = 16;
    const [pondRef] = useCylinder(() => ({
      args: [radius, radius, 0.1, segments],
      position: [position[0], position[1] + 0.05, position[2]],
      rotation: [Math.PI / 2, 0, 0],
      type: 'Static',
    }));

    return (
      <mesh ref={pondRef} receiveShadow key={`pond-${position.join('-')}`}>
        <cylinderGeometry args={[radius, radius, 0.1, segments]} />
        <meshStandardMaterial color="#1976d2" transparent opacity={0.8} />
      </mesh>
    );
  };

  // Tall grass patches (for hiding)
  const createGrassPatch = (position, size) => {
    return (
      <group key={`grass-${position.join('-')}`} position={[position[0], position[1], position[2]]}>
        {/* Base */}
        <mesh receiveShadow>
          <boxGeometry args={[size[0], 0.1, size[1]]} />
          <meshStandardMaterial color="#7cb342" />
        </mesh>
        
        {/* Grass blades (simplified representation) */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = (Math.random() - 0.5) * size[0] * 0.8;
          const z = (Math.random() - 0.5) * size[1] * 0.8;
          const height = 0.5 + Math.random() * 0.5;
          
          return (
            <mesh key={`blade-${i}`} position={[x, height/2, z]} castShadow>
              <boxGeometry args={[0.1, height, 0.1]} />
              <meshStandardMaterial color="#8bc34a" />
            </mesh>
          );
        })}
      </group>
    );
  };

  return (
    <group>
      {/* Ground */}
      <mesh ref={groundRef} receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial color="#7cb342" />
      </mesh>

      {/* Create trees in various positions */}
      {createTree([8, 0, 3], 'normal')}
      {createTree([-7, 0, -8], 'pine')}
      {createTree([3, 0, -10], 'wide')}
      {createTree([15, 0, 8], 'normal')}
      {createTree([-12, 0, 10], 'pine')}
      {createTree([8, 0, -15], 'wide')}
      {createTree([-15, 0, -12], 'normal')}
      {createTree([25, 0, 25], 'pine')}
      {createTree([-25, 0, -25], 'wide')}
      {createTree([20, 0, -20], 'normal')}
      {createTree([-20, 0, 20], 'pine')}
      
      {/* Create a cluster of trees */}
      {createTree([12, 0, 12], 'normal')}
      {createTree([14, 0, 13], 'pine')}
      {createTree([13, 0, 15], 'wide')}
      {createTree([11, 0, 14], 'normal')}
      
      {/* Hills */}
      {createHill([15, 0, 15], 5)}
      {createHill([-15, 0, -15], 7)}
      {createHill([25, 0, -10], 6)}
      {createHill([-25, 0, 10], 8)}
      
      {/* Rocks and boulders */}
      {createRock([5, 0, -5], [2, 1.5, 2])}
      {createRock([-8, 0, 5], [3, 2, 2])}
      {createRock([12, 0, -8], [1.5, 1, 1.5])}
      
      {/* Walls and barriers */}
      {createWall([0, 1.5, 20], [15, 3, 1])}
      {createWall([-20, 1.5, 0], [1, 3, 15], [0, Math.PI/2, 0])}
      
      {/* Wooden cabin */}
      {createCabin([15, 0, -15])}
      
      {/* Tunnels */}
      {createTunnel([-10, 0, 0], 10, 0)}
      {createTunnel([10, 0, -5], 12, 90)}
      
      {/* Small pond in center */}
      {createPond([0, 0, 0], 8)}
      
      {/* Tall grass patches for hiding */}
      {createGrassPatch([5, 0, 10], [4, 4])}
      {createGrassPatch([-8, 0, -12], [5, 3])}
      {createGrassPatch([18, 0, 5], [6, 6])}
      {createGrassPatch([-15, 0, 15], [4, 5])}
      
      {/* Building */}
      <group position={[10, 0, -10]}>
        {createWall([0, 2.5, 0], [8, 5, 8], [0, 0, 0], "#90a4ae")}
        <mesh position={[0, 5.5, 0]} castShadow>
          <coneGeometry args={[5, 3, 4]} />
          <meshStandardMaterial color="#607d8b" />
        </mesh>
        
        {/* Door */}
        {createWall([0, 1.5, 4.01], [2, 3, 0.1], [0, 0, 0], "#455a64")}
        
        {/* Windows */}
        {createWall([3, 2.5, 4.01], [1.5, 1.5, 0.1], [0, 0, 0], "#bbdefb")}
        {createWall([-3, 2.5, 4.01], [1.5, 1.5, 0.1], [0, 0, 0], "#bbdefb")}
      </group>
    </group>
  );
};

export default GrassMap;
