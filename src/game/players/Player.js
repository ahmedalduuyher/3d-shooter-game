import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

const Player = React.forwardRef(({ name, team, position, controls }, ref) => {
  // Physics body for the player
  const [physicsRef, api] = useBox(() => ({
    mass: 1,
    position,
    type: 'Dynamic',
    args: [0.5, 1.8, 0.5], // Player hitbox size
    fixedRotation: true, // Prevent player from rotating
    linearDamping: 0.95, // Add some friction
    material: {
      friction: 0.1
    }
  }));

  // Combine refs
  const combinedRef = useRef();
  React.useImperativeHandle(ref, () => combinedRef.current);

  // Player state
  const playerState = useRef({
    position: [...position],
    velocity: [0, 0, 0],
    rotation: [0, 0, 0],
    onGround: false,
    jumping: false,
    crouching: false,
    health: 100,
    currentWeapon: null,
    ammo: {
      current: 30,
      reserve: 90
    },
    team,
    kills: 0,
    deaths: 0
  });

  // Movement controls
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    crouch: false
  });

  // Mouse controls
  const mouse = useRef({
    x: 0,
    y: 0,
    leftButton: false,
    rightButton: false
  });

  // Movement parameters
  const moveSpeed = 5;
  const jumpForce = 7;
  const crouchHeight = 1.0; // Height when crouching
  const standHeight = 1.8; // Normal height

  // Set up key listeners
  useEffect(() => {
    const keyDownHandler = (e) => {
      if (e.key.toLowerCase() === controls.forward) keys.current.forward = true;
      if (e.key.toLowerCase() === controls.backward) keys.current.backward = true;
      if (e.key.toLowerCase() === controls.left) keys.current.left = true;
      if (e.key.toLowerCase() === controls.right) keys.current.right = true;
      if (e.key.toLowerCase() === controls.jump) keys.current.jump = true;
      if (e.key.toLowerCase() === controls.crouch) keys.current.crouch = true;
      if (e.key.toLowerCase() === controls.reload) handleReload();
      if (e.key.toLowerCase() === controls.pickup) handlePickup();
    };

    const keyUpHandler = (e) => {
      if (e.key.toLowerCase() === controls.forward) keys.current.forward = false;
      if (e.key.toLowerCase() === controls.backward) keys.current.backward = false;
      if (e.key.toLowerCase() === controls.left) keys.current.left = false;
      if (e.key.toLowerCase() === controls.right) keys.current.right = false;
      if (e.key.toLowerCase() === controls.jump) keys.current.jump = false;
      if (e.key.toLowerCase() === controls.crouch) {
        keys.current.crouch = false;
        if (playerState.current.crouching) {
          // Stand up if was crouching
          playerState.current.crouching = false;
          api.position.set(
            playerState.current.position[0],
            playerState.current.position[1] + (standHeight - crouchHeight) / 2,
            playerState.current.position[2]
          );
          api.shapes.set([{ args: [0.5, standHeight, 0.5], type: 'Box' }]);
        }
      }
    };

    const mouseDownHandler = (e) => {
      if (e.button === 0) { // Left mouse button
        mouse.current.leftButton = true;
        handleShoot();
      }
      if (e.button === 2) { // Right mouse button
        mouse.current.rightButton = true;
        handleScope();
      }
    };

    const mouseUpHandler = (e) => {
      if (e.button === 0) mouse.current.leftButton = false;
      if (e.button === 2) mouse.current.rightButton = false;
    };

    const mouseMoveHandler = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    // Prevent context menu on right click
    const contextMenuHandler = (e) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('contextmenu', contextMenuHandler);

    // Lock pointer for FPS controls
    document.body.requestPointerLock = document.body.requestPointerLock || 
                                       document.body.mozRequestPointerLock ||
                                       document.body.webkitRequestPointerLock;
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', () => {
        document.body.requestPointerLock();
      });
    }

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('contextmenu', contextMenuHandler);
    };
  }, [controls, api]);

  // Subscribe to physics body position changes
  useEffect(() => {
    const unsubscribe = api.position.subscribe(v => {
      playerState.current.position = v;
      if (combinedRef.current) {
        combinedRef.current.position.set(v[0], v[1], v[2]);
      }
    });
    return unsubscribe;
  }, [api]);

  // Subscribe to physics body velocity changes
  useEffect(() => {
    const unsubscribe = api.velocity.subscribe(v => {
      playerState.current.velocity = v;
      
      // Check if player is on ground (y velocity near zero)
      playerState.current.onGround = Math.abs(v[1]) < 0.1;
      
      // Reset jumping state if on ground
      if (playerState.current.onGround) {
        playerState.current.jumping = false;
      }
    });
    return unsubscribe;
  }, [api]);

  // Handle player rotation based on mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === document.body) {
        // Rotate player based on mouse movement
        const sensitivity = 0.002;
        const rotationY = playerState.current.rotation[1] - e.movementX * sensitivity;
        
        // Update player rotation
        playerState.current.rotation[1] = rotationY;
        
        if (combinedRef.current) {
          combinedRef.current.rotation.y = rotationY;
        }
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle shooting
  const handleShoot = () => {
    if (playerState.current.currentWeapon && 
        playerState.current.currentWeapon.canFire()) {
      
      playerState.current.currentWeapon.fire();
      
      // Update ammo display
      updateAmmoDisplay();
      
      // TODO: Implement actual shooting logic with raycasting
      console.log('Shooting with', playerState.current.currentWeapon.name);
    }
  };

  // Handle scoping/aiming
  const handleScope = () => {
    // TODO: Implement scoping logic
    console.log('Scoping/aiming');
  };

  // Handle reloading
  const handleReload = () => {
    if (playerState.current.currentWeapon) {
      const reloading = playerState.current.currentWeapon.reload();
      
      if (reloading) {
        console.log('Reloading', playerState.current.currentWeapon.name);
        
        // Update ammo display after reload completes
        setTimeout(() => {
          updateAmmoDisplay();
        }, playerState.current.currentWeapon.reloadTime * 1000);
      }
    }
  };

  // Handle weapon pickup
  const handlePickup = () => {
    // TODO: Implement weapon pickup logic
    console.log('Attempting to pick up weapon');
  };

  // Update ammo display in HUD
  const updateAmmoDisplay = () => {
    const ammoCounter = document.querySelector('.ammo-counter');
    if (ammoCounter && playerState.current.currentWeapon) {
      ammoCounter.textContent = `${playerState.current.currentWeapon.currentAmmo}/${playerState.current.currentWeapon.reserveAmmo}`;
    }
  };

  // Update player position and handle movement
  useFrame((state, delta) => {
    if (!playerState.current.onGround && !playerState.current.jumping) {
      return; // Don't allow air control except for initial jump
    }
    
    // Calculate movement direction based on player rotation
    const rotation = playerState.current.rotation[1];
    
    // Movement vectors
    let moveX = 0;
    let moveZ = 0;
    
    // Forward/backward movement
    if (keys.current.forward) {
      moveX += Math.sin(rotation) * moveSpeed * delta;
      moveZ += Math.cos(rotation) * moveSpeed * delta;
    }
    if (keys.current.backward) {
      moveX -= Math.sin(rotation) * moveSpeed * delta;
      moveZ -= Math.cos(rotation) * moveSpeed * delta;
    }
    
    // Left/right movement (strafing)
    if (keys.current.left) {
      moveX -= Math.cos(rotation) * moveSpeed * delta;
      moveZ += Math.sin(rotation) * moveSpeed * delta;
    }
    if (keys.current.right) {
      moveX += Math.cos(rotation) * moveSpeed * delta;
      moveZ -= Math.sin(rotation) * moveSpeed * delta;
    }
    
    // Apply movement
    api.velocity.set(
      moveX * 60, // Scale by 60 to normalize for delta
      playerState.current.velocity[1],
      moveZ * 60
    );
    
    // Handle jumping
    if (keys.current.jump && playerState.current.onGround && !playerState.current.jumping) {
      playerState.current.jumping = true;
      api.velocity.set(
        playerState.current.velocity[0],
        jumpForce,
        playerState.current.velocity[2]
      );
    }
    
    // Handle crouching
    if (keys.current.crouch && !playerState.current.crouching && playerState.current.onGround) {
      playerState.current.crouching = true;
      
      // Adjust player hitbox and position
      api.position.set(
        playerState.current.position[0],
        playerState.current.position[1] - (standHeight - crouchHeight) / 2,
        playerState.current.position[2]
      );
      api.shapes.set([{ args: [0.5, crouchHeight, 0.5], type: 'Box' }]);
    }
  });

  return (
    <group ref={combinedRef}>
      {/* Player model - simple box for now, will be replaced with proper model */}
      <mesh ref={physicsRef} castShadow>
        <boxGeometry args={[0.5, standHeight, 0.5]} />
        <meshStandardMaterial color={team === 'red' ? '#ff4d4d' : '#4d79ff'} />
      </mesh>
      
      {/* Player name tag */}
      <group position={[0, 2.2, 0]}>
        <mesh>
          <boxGeometry args={[1, 0.3, 0.05]} />
          <meshBasicMaterial color={team === 'red' ? '#ff4d4d' : '#4d79ff'} />
        </mesh>
      </group>
      
      {/* First-person weapon model (only visible to the player) */}
      {/* This will be implemented later */}
    </group>
  );
});

export default Player;
