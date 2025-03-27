import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import THREE from '../utils/ThreeShims';

const PixelRenderer = ({ resolution = 0.5 }) => {
  const { gl, scene, camera } = useThree();
  const pixelRenderTarget = useRef();
  
  // Set up pixel rendering effect
  useEffect(() => {
    // Configure renderer for pixel effect
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    
    // Create render target with lower resolution for pixelated effect
    const pixelRenderTargetOptions = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      encoding: THREE.sRGBEncoding
    };
    
    // Create render target at reduced resolution
    const pixelScale = resolution;
    pixelRenderTarget.current = new THREE.WebGLRenderTarget(
      window.innerWidth * pixelScale,
      window.innerHeight * pixelScale,
      pixelRenderTargetOptions
    );
    
    // Handle window resize
    const handleResize = () => {
      pixelRenderTarget.current.setSize(
        window.innerWidth * pixelScale,
        window.innerHeight * pixelScale
      );
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      pixelRenderTarget.current.dispose();
    };
  }, [gl, resolution]);
  
  // Apply pixel effect on each frame
  useFrame(() => {
    // Render scene to low-res render target
    gl.setRenderTarget(pixelRenderTarget.current);
    gl.render(scene, camera);
    
    // Render low-res result to screen
    gl.setRenderTarget(null);
    gl.render(scene, camera);
  }, 1);
  
  return null;
};

export default PixelRenderer;
