import React, { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader';
import * as THREE from 'three';

// Extend Three.js with postprocessing classes
extend({ EffectComposer, RenderPass, ShaderPass });

// Custom pixel shader for pixelated rendering
const PixelatedShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'resolution': { value: new THREE.Vector2(800, 600) },
    'pixelSize': { value: 4.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    varying vec2 vUv;
    
    void main() {
      vec2 dxy = pixelSize / resolution;
      vec2 coord = dxy * floor(vUv / dxy);
      gl_FragColor = texture2D(tDiffuse, coord);
    }
  `
};

const PixelRenderer = () => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef();
  
  // Set up effect composer on mount
  useEffect(() => {
    const composer = composerRef.current;
    composer.setSize(size.width, size.height);
    
    // Add pixel shader pass
    const pixelPass = new ShaderPass(PixelatedShader);
    pixelPass.uniforms.resolution.value.set(size.width, size.height);
    pixelPass.uniforms.pixelSize.value = 4.0; // Adjust for desired pixel size
    
    composer.addPass(pixelPass);
  }, [size]);
  
  // Update effect composer on each frame
  useFrame(() => {
    composerRef.current.render();
  }, 1);
  
  return (
    <effectComposer ref={composerRef} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
    </effectComposer>
  );
};

export default PixelRenderer;
