import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

const CameraController = ({ playerRef }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  
  // Set up camera properties
  useEffect(() => {
    camera.fov = 75;
    camera.near = 0.1;
    camera.far = 1000;
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  
  // Follow player if playerRef is provided
  useFrame(() => {
    if (playerRef && playerRef.current) {
      const playerPosition = playerRef.current.position;
      
      // Position camera behind player
      camera.position.x = playerPosition.x;
      camera.position.z = playerPosition.z + 5;
      camera.position.y = playerPosition.y + 2;
      
      // Look at player
      camera.lookAt(
        playerPosition.x,
        playerPosition.y + 1,
        playerPosition.z
      );
    }
  });
  
  return (
    <>
      <PerspectiveCamera makeDefault />
      {!playerRef && (
        <OrbitControls
          ref={controlsRef}
          args={[camera, gl.domElement]}
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.5}
        />
      )}
    </>
  );
};

export default CameraController;
