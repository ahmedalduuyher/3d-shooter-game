import React, { useState, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import THREE from '../utils/ThreeShims';
import Weapon, { AK47, Shotgun, Sniper, SMG } from './Weapon';

const WeaponSystem = ({ player, playerRef }) => {
  const { scene, raycaster, camera } = useThree();
  const [droppedWeapons, setDroppedWeapons] = useState([]);
  const [despawnTimers, setDespawnTimers] = useState({});
  const weaponRaycaster = useRef(new THREE.Raycaster());
  
  // Function to drop a weapon at a position
  const dropWeapon = (weaponType, position, rotation) => {
    const weaponId = `weapon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add weapon to dropped weapons list
    setDroppedWeapons(prev => [
      ...prev,
      {
        id: weaponId,
        type: weaponType,
        position,
        rotation,
        droppedAt: Date.now()
      }
    ]);
    
    // Set despawn timer
    const timerId = setTimeout(() => {
      // Remove weapon after 10 seconds
      setDroppedWeapons(prev => prev.filter(w => w.id !== weaponId));
      
      // Clean up timer reference
      setDespawnTimers(prev => {
        const newTimers = {...prev};
        delete newTimers[weaponId];
        return newTimers;
      });
    }, 10000);
    
    // Store timer reference
    setDespawnTimers(prev => ({
      ...prev,
      [weaponId]: timerId
    }));
  };

  // Function to pick up a weapon
  const pickUpWeapon = (weaponId) => {
    // Find the weapon
    const weapon = droppedWeapons.find(w => w.id === weaponId);
    if (!weapon) return null;
    
    // Remove from dropped weapons
    setDroppedWeapons(prev => prev.filter(w => w.id !== weaponId));
    
    // Clear despawn timer
    if (despawnTimers[weaponId]) {
      clearTimeout(despawnTimers[weaponId]);
      setDespawnTimers(prev => {
        const newTimers = {...prev};
        delete newTimers[weaponId];
        return newTimers;
      });
    }
    
    // Return the weapon type
    return weapon.type;
  };

  // Create a new weapon instance based on type
  const createWeapon = (type) => {
    switch (type) {
      case 'AK-47':
        return new AK47();
      case 'Shotgun':
        return new Shotgun();
      case 'Sniper':
        return new Sniper();
      case 'SMG':
        return new SMG();
      default:
        return new AK47(); // Default to AK-47
    }
  };

  // Handle shooting mechanics
  const handleShoot = (weapon, position, direction) => {
    if (!weapon || !weapon.canFire()) return false;
    
    // Fire the weapon
    const spreadAngles = weapon.fire();
    
    if (spreadAngles === false) return false; // Couldn't fire
    
    // For shotgun, spreadAngles is an array of angles
    // For other weapons, we just need to calculate one spread
    const angles = Array.isArray(spreadAngles) ? 
      spreadAngles : 
      [weapon.calculateSpread()];
    
    // Process each shot/pellet
    angles.forEach(angle => {
      // Apply spread to direction
      const spreadDirection = new THREE.Vector3().copy(direction);
      spreadDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      
      // Create raycaster for the shot
      weaponRaycaster.current.set(position, spreadDirection);
      
      // Check for hits
      const hits = weaponRaycaster.current.intersectObjects(scene.children, true);
      
      // Process hits
      if (hits.length > 0) {
        const hit = hits[0];
        
        // Calculate damage based on distance
        const damage = weapon.calculateDamage(hit.distance);
        
        // Check if hit a player
        if (hit.object.parent && hit.object.parent.name && hit.object.parent.name.startsWith('player')) {
          // Handle player hit
          console.log(`Hit player with ${damage} damage`);
          
          // In a real implementation, we would apply damage to the hit player
          // and check if they died
        }
      }
    });
    
    return true;
  };

  // Handle weapon pickup detection
  useEffect(() => {
    if (!playerRef || !playerRef.current) return;
    
    const checkForWeaponPickup = () => {
      // Only check if player is close to a weapon
      droppedWeapons.forEach(weapon => {
        const playerPos = playerRef.current.position;
        const weaponPos = new THREE.Vector3(
          weapon.position[0], 
          weapon.position[1], 
          weapon.position[2]
        );
        
        // Check distance
        const distance = playerPos.distanceTo(weaponPos);
        
        if (distance < 2) { // Within pickup range
          // Check if player pressed pickup key (E)
          // This would be handled in the Player component
        }
      });
    };
    
    const pickupInterval = setInterval(checkForWeaponPickup, 200);
    
    return () => {
      clearInterval(pickupInterval);
    };
  }, [playerRef, droppedWeapons]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(despawnTimers).forEach(timerId => {
        clearTimeout(timerId);
      });
    };
  }, [despawnTimers]);

  // Generate a random weapon type
  const getRandomWeaponType = () => {
    const weapons = ['AK-47', 'Shotgun', 'Sniper', 'SMG'];
    return weapons[Math.floor(Math.random() * weapons.length)];
  };

  // Handle player death - drop their weapon
  const handlePlayerDeath = (player) => {
    if (player && player.currentWeapon) {
      dropWeapon(
        player.currentWeapon.name,
        [player.position.x, player.position.y, player.position.z],
        [0, player.rotation.y, 0]
      );
    }
  };

  return (
    <group>
      {/* Render all dropped weapons */}
      {droppedWeapons.map(weapon => (
        <Weapon 
          key={weapon.id}
          type={weapon.type}
          position={weapon.position}
          rotation={weapon.rotation}
          dropped={true}
          onPickup={() => pickUpWeapon(weapon.id)}
        />
      ))}
    </group>
  );
};

export default WeaponSystem;
