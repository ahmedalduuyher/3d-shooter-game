import React, { useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import THREE from '../utils/ThreeShims';

const PlayerCamera = ({ playerRef, isFirstPerson = true }) => {
  const { camera } = useThree();
  const cameraPositionRef = useRef(new THREE.Vector3());
  const cameraTargetRef = useRef(new THREE.Vector3());
  
  // Camera settings
  const [cameraSettings] = useState({
    firstPerson: {
      height: 1.7,
      distance: 0,
      smoothing: 0.5
    },
    thirdPerson: {
      height: 2.5,
      distance: 5,
      smoothing: 0.1
    }
  });
  
  // Set up camera to follow player
  useEffect(() => {
    // Initial camera setup
    if (isFirstPerson) {
      camera.fov = 75;
    } else {
      camera.fov = 60;
    }
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
    
    // Update camera position based on player position
    const updateCamera = () => {
      if (!playerRef.current) return;
      
      const playerPosition = playerRef.current.position;
      const playerRotation = playerRef.current.rotation;
      
      const settings = isFirstPerson ? 
        cameraSettings.firstPerson : 
        cameraSettings.thirdPerson;
      
      if (isFirstPerson) {
        // First-person camera
        cameraPositionRef.current.set(
          playerPosition.x,
          playerPosition.y + settings.height,
          playerPosition.z
        );
        
        // Look in the direction the player is facing
        cameraTargetRef.current.set(
          playerPosition.x - Math.sin(playerRotation.y),
          playerPosition.y + settings.height,
          playerPosition.z - Math.cos(playerRotation.y)
        );
      } else {
        // Third-person camera
        // Position camera behind player
        cameraPositionRef.current.set(
          playerPosition.x + Math.sin(playerRotation.y) * settings.distance,
          playerPosition.y + settings.height,
          playerPosition.z + Math.cos(playerRotation.y) * settings.distance
        );
        
        // Look at player
        cameraTargetRef.current.set(
          playerPosition.x,
          playerPosition.y + 1,
          playerPosition.z
        );
      }
      
      // Apply camera smoothing
      camera.position.lerp(cameraPositionRef.current, settings.smoothing);
      
      // Set camera look target
      if (isFirstPerson) {
        camera.lookAt(cameraTargetRef.current);
      } else {
        const lookTarget = new THREE.Vector3();
        lookTarget.copy(cameraTargetRef.current);
        camera.lookAt(lookTarget);
      }
    };
    
    // Set up animation frame for camera updates
    let animationFrameId;
    
    const animate = () => {
      updateCamera();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, playerRef, isFirstPerson, cameraSettings]);
  
  // Toggle between first and third person view on key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'v') {
        // Toggle camera mode
        // This would be implemented in the parent component
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default PlayerCamera;
