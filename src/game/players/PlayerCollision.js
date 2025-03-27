import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import THREE from '../utils/ThreeShims';

const PlayerCollision = ({ playerRef }) => {
  const { scene } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  
  // Set up collision detection
  useEffect(() => {
    // Create collision detection rays
    const directions = [
      new THREE.Vector3(0, -1, 0), // Down
      new THREE.Vector3(1, 0, 0),  // Right
      new THREE.Vector3(-1, 0, 0), // Left
      new THREE.Vector3(0, 0, 1),  // Forward
      new THREE.Vector3(0, 0, -1)  // Backward
    ];
    
    const checkCollisions = () => {
      if (!playerRef.current) return;
      
      const playerPosition = playerRef.current.position;
      
      // Check each direction for collisions
      directions.forEach(direction => {
        raycasterRef.current.set(playerPosition, direction);
        
        const intersects = raycasterRef.current.intersectObjects(scene.children, true);
        
        // Handle collisions if objects are too close
        if (intersects.length > 0 && intersects[0].distance < 0.5) {
          // Adjust player position or velocity based on collision
          // This will be implemented in the Player component
        }
      });
    };
    
    // Set up interval for collision detection
    const collisionInterval = setInterval(checkCollisions, 100);
    
    return () => {
      clearInterval(collisionInterval);
    };
  }, [scene, playerRef]);
  
  return null; // This component doesn't render anything
};

export default PlayerCollision;
