import React, { useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import THREE from '../utils/ThreeShims';

// Base class for all weapons
class WeaponBase {
  constructor(name, damage, fireRate, reloadTime, magazineSize, reserveAmmo, range, spread) {
    this.name = name;
    this.damage = damage;
    this.fireRate = fireRate; // shots per second
    this.reloadTime = reloadTime; // seconds
    this.magazineSize = magazineSize;
    this.reserveAmmo = reserveAmmo;
    this.currentAmmo = magazineSize;
    this.range = range; // maximum effective range
    this.spread = spread; // accuracy (lower is better)
    this.isReloading = false;
    this.lastFired = 0;
  }

  canFire() {
    const now = Date.now();
    return (
      this.currentAmmo > 0 &&
      !this.isReloading &&
      now - this.lastFired > 1000 / this.fireRate
    );
  }

  fire() {
    if (!this.canFire()) return false;
    
    this.currentAmmo--;
    this.lastFired = Date.now();
    return true;
  }

  reload() {
    if (this.isReloading || this.currentAmmo === this.magazineSize || this.reserveAmmo <= 0) return false;
    
    this.isReloading = true;
    
    setTimeout(() => {
      const ammoNeeded = this.magazineSize - this.currentAmmo;
      const ammoToAdd = Math.min(ammoNeeded, this.reserveAmmo);
      
      this.currentAmmo += ammoToAdd;
      this.reserveAmmo -= ammoToAdd;
      this.isReloading = false;
    }, this.reloadTime * 1000);
    
    return true;
  }

  // Calculate damage based on distance
  calculateDamage(distance) {
    // Linear falloff based on distance
    const falloffFactor = Math.max(0, 1 - (distance / this.range));
    return this.damage * falloffFactor;
  }

  // Calculate spread for a shot
  calculateSpread() {
    // Return a random angle within the spread range
    return (Math.random() - 0.5) * this.spread;
  }
}

// Specific weapon classes
export class AK47 extends WeaponBase {
  constructor() {
    // name, damage, fireRate, reloadTime, magazineSize, reserveAmmo, range, spread
    super('AK-47', 25, 8, 2.5, 30, 90, 100, 0.05);
  }
}

export class Shotgun extends WeaponBase {
  constructor() {
    // Shotgun has high damage but short range and slow fire rate
    super('Shotgun', 80, 1, 3, 8, 32, 30, 0.2);
  }

  // Override fire method for shotgun to fire multiple pellets
  fire() {
    if (super.fire()) {
      // Return array of spread angles for multiple pellets
      return Array.from({ length: 8 }, () => this.calculateSpread());
    }
    return false;
  }
}

export class Sniper extends WeaponBase {
  constructor() {
    // Sniper has highest damage, longest range, but slowest fire rate
    super('Sniper', 100, 1, 3.5, 5, 20, 200, 0.01);
  }
}

export class SMG extends WeaponBase {
  constructor() {
    // SMG has low damage but high fire rate
    super('SMG', 15, 15, 2, 25, 100, 50, 0.08);
  }
}

// Weapon component for rendering and physics
const Weapon = ({ type, position, rotation, dropped = false, onPickup }) => {
  // Physics for dropped weapons
  const [ref, api] = useBox(() => ({
    mass: dropped ? 1 : 0,
    position,
    rotation,
    args: [0.5, 0.2, 1],
    type: dropped ? 'Dynamic' : 'Static',
    onCollide: (e) => {
      // Check if collision is with player
      if (e.body.name === 'player' && dropped && onPickup) {
        onPickup();
      }
    }
  }));

  // Determine weapon color and shape based on type
  let color;
  let dimensions = [0.5, 0.2, 1]; // default size
  
  switch (type) {
    case 'AK-47':
      color = '#8d6e63';
      dimensions = [0.5, 0.2, 1];
      break;
    case 'Shotgun':
      color = '#5d4037';
      dimensions = [0.4, 0.25, 0.8];
      break;
    case 'Sniper':
      color = '#455a64';
      dimensions = [0.3, 0.2, 1.2];
      break;
    case 'SMG':
      color = '#78909c';
      dimensions = [0.4, 0.2, 0.7];
      break;
    default:
      color = '#9e9e9e';
  }

  // Set up despawn timer for dropped weapons
  useEffect(() => {
    let despawnTimer;
    
    if (dropped) {
      // Despawn after 10 seconds
      despawnTimer = setTimeout(() => {
        // Remove weapon from scene
        if (ref.current) {
          ref.current.parent.remove(ref.current);
        }
      }, 10000);
    }
    
    return () => {
      if (despawnTimer) {
        clearTimeout(despawnTimer);
      }
    };
  }, [dropped, ref]);

  return (
    <mesh ref={ref} castShadow name={`weapon-${type}`}>
      <boxGeometry args={dimensions} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Weapon;
