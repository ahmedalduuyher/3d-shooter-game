import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import THREE from '../utils/ThreeShims';

const LightingSetup = () => {
  const { scene } = useThree();
  const directionalLightRef = useRef();
  
  // Set up scene lighting
  useEffect(() => {
    // Set background color
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Add fog for distance effect
    scene.fog = new THREE.Fog(0x87CEEB, 30, 100);
    
    // Configure shadows
    if (directionalLightRef.current) {
      const light = directionalLightRef.current;
      
      // Shadow map settings
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 50;
      light.shadow.camera.left = -20;
      light.shadow.camera.right = 20;
      light.shadow.camera.top = 20;
      light.shadow.camera.bottom = -20;
    }
  }, [scene]);
  
  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.4} color={0xffffff} />
      
      {/* Main directional light with shadows */}
      <directionalLight 
        ref={directionalLightRef}
        position={[10, 20, 10]} 
        intensity={0.8} 
        castShadow 
      />
      
      {/* Additional fill light */}
      <directionalLight 
        position={[-10, 10, -10]} 
        intensity={0.3} 
        color={0x9090ff} 
      />
      
      {/* Ground hemisphere light */}
      <hemisphereLight 
        args={[0x87CEEB, 0x444444, 0.3]} 
      />
    </>
  );
};

export default LightingSetup;
