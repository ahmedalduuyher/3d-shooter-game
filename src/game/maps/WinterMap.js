import React from 'react';
import { useBox, useCylinder, useSphere } from '@react-three/cannon';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import THREE from '../utils/ThreeShims';


// This is an enhanced version of the winter map with more detailed features
const WinterMap = () => {
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
    material: { friction: 0.2 }
  }));

  // Trees
  const createTree = (position) => {
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
        
        {/* Tree top */}
        <mesh position={[position[0], position[1] + 4.5, position[2]]} castShadow>
          <coneGeometry args={[2, 4, 8]} />
          <meshStandardMaterial color="#7cb342" />
        </mesh>
      </group>
    );
  };

  // Snow hills
  const createSnowHill = (position, size) => {
    const [hillRef] = useSphere(() => ({
      args: [size],
      position: [position[0], position[1] - size/2 + 0.5, position[2]],
      type: 'Static',
    }));

    return (
      <mesh ref={hillRef} castShadow receiveShadow key={`hill-${position.join('-')}`}>
        <sphereGeometry args={[size, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e0f0ff" />
      </mesh>
    );
  };

  // Ice patches (slippery areas)
  const createIcePatch = (position, size) => {
    const [iceRef] = useBox(() => ({
      args: [size[0], 0.1, size[1]],
      position: [position[0], 0.05, position[2]],
      type: 'Static',
      material: { friction: 0.01 }
    }));

    return (
      <mesh ref={iceRef} receiveShadow key={`ice-${position.join('-')}`}>
        <boxGeometry args={[size[0], 0.1, size[1]]} />
        <meshStandardMaterial color="#a5d6f7" transparent opacity={0.7} />
      </mesh>
    );
  };

  // Walls and barriers
  const createWall = (position, size, rotation = [0, 0, 0]) => {
    const [wallRef] = useBox(() => ({
      args: [size[0], size[1], size[2]],
      position,
      rotation,
      type: 'Static',
    }));

    return (
      <mesh ref={wallRef} castShadow receiveShadow key={`wall-${position.join('-')}`}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color="#b0bec5" />
      </mesh>
    );
  };

  // Snow fort
  const createSnowFort = (position) => {
    return (
      <group key={`fort-${position.join('-')}`} position={[position[0], position[1], position[2]]}>
        {/* Base walls */}
        {createWall([0, 1, 5], [10, 2, 1])}
        {createWall([0, 1, -5], [10, 2, 1])}
        {createWall([5, 1, 0], [1, 2, 10], [0, Math.PI/2, 0])}
        {createWall([-5, 1, 0], [1, 2, 10], [0, Math.PI/2, 0])}
        
        {/* Corner towers */}
        {createWall([5, 2, 5], [1, 4, 1])}
        {createWall([5, 2, -5], [1, 4, 1])}
        {createWall([-5, 2, 5], [1, 4, 1])}
        {createWall([-5, 2, -5], [1, 4, 1])}
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
      [0, rotationY, 0]
    );
    
    const rightWall = createWall(
      [
        position[0] - Math.sin(rotationY) * tunnelWidth/2,
        position[1] + tunnelHeight/2,
        position[2] - Math.cos(rotationY) * tunnelWidth/2
      ],
      [length, tunnelHeight, wallThickness],
      [0, rotationY, 0]
    );
    
    const ceiling = createWall(
      [
        position[0],
        position[1] + tunnelHeight,
        position[2]
      ],
      [length, wallThickness, tunnelWidth],
      [0, rotationY, 0]
    );
    
    return (
      <group key={`tunnel-${position.join('-')}`}>
        {leftWall}
        {rightWall}
        {ceiling}
      </group>
    );
  };

  // Frozen lake (center of map)
  const createFrozenLake = (position, radius) => {
    const segments = 16;
    const [lakeRef] = useCylinder(() => ({
      args: [radius, radius, 0.1, segments],
      position: [position[0], position[1] + 0.05, position[2]],
      rotation: [Math.PI / 2, 0, 0],
      type: 'Static',
      material: { friction: 0.01 }
    }));

    return (
      <mesh ref={lakeRef} receiveShadow key={`lake-${position.join('-')}`}>
        <cylinderGeometry args={[radius, radius, 0.1, segments]} />
        <meshStandardMaterial color="#a5d6f7" transparent opacity={0.8} />
      </mesh>
    );
  };

  return (
    <group>
      {/* Ground */}
      <mesh ref={groundRef} receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial color="#e0f0ff" />
      </mesh>

      {/* Create trees in various positions */}
      {createTree([5, 0, 5])}
      {createTree([-5, 0, -5])}
      {createTree([15, 0, 8])}
      {createTree([-12, 0, 10])}
      {createTree([8, 0, -15])}
      {createTree([-15, 0, -12])}
      {createTree([25, 0, 25])}
      {createTree([-25, 0, -25])}
      {createTree([20, 0, -20])}
      {createTree([-20, 0, 20])}
      
      {/* Create a cluster of trees */}
      {createTree([12, 0, 12])}
      {createTree([14, 0, 13])}
      {createTree([13, 0, 15])}
      {createTree([11, 0, 14])}
      
      {/* Snow hills */}
      {createSnowHill([15, 0, 15], 5)}
      {createSnowHill([-15, 0, -15], 7)}
      {createSnowHill([25, 0, -10], 6)}
      {createSnowHill([-25, 0, 10], 8)}
      
      {/* Ice patches */}
      {createIcePatch([0, 0, 10], [8, 8])}
      {createIcePatch([-12, 0, -8], [6, 6])}
      
      {/* Walls and barriers */}
      {createWall([0, 1, 20], [15, 2, 1])}
      {createWall([-20, 1, 0], [1, 2, 15], [0, Math.PI/2, 0])}
      
      {/* Snow fort */}
      {createSnowFort([15, 0, -15])}
      
      {/* Tunnels */}
      {createTunnel([-10, 0, 0], 10, 0)}
      {createTunnel([10, 0, -5], 12, 90)}
      
      {/* Frozen lake in center */}
      {createFrozenLake([0, 0, 0], 10)}
    </group>
  );
};

export default WinterMap;
