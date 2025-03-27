import React from 'react';
import { useThree } from '@react-three/fiber';
import { usePlane } from '@react-three/cannon';

// Map components
import WinterMap from './WinterMap';
import GrassMap from './GrassMap';

const Map = ({ mapName }) => {
  // Create a ground plane for physics
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    position: [0, 0, 0],
    type: 'Static'
  }));

  return (
    <group>
      {/* Ground physics plane */}
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial visible={false} />
      </mesh>
      
      {/* Render the selected map */}
      {mapName === 'winter' ? (
        <WinterMap />
      ) : (
        <GrassMap />
      )}
    </group>
  );
};

export default Map;
