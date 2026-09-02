import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

export default function LunarGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setHoverCoordinates, targetCoordinates, setTargetCoordinates, sunElevation, sunAzimuth } = useAppStore();
  const { gl } = useThree();
  
  // Using standard resolution to ensure maximum browser compatibility and avoid downsampling blur
  const [colorMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
  ]);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    colorMap.anisotropy = maxAnisotropy;
    colorMap.needsUpdate = true;
  }, [colorMap, gl]);

  // Procedural glowing sun texture
  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.1, 'rgba(255, 250, 220, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 180, 50, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0002;
    }
  });

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    const pt = new THREE.Vector3(e.point.x, e.point.y, e.point.z).normalize();
    const lat = Math.asin(pt.y) * (180 / Math.PI);
    const lon = Math.atan2(pt.x, pt.z) * (180 / Math.PI);
    setHoverCoordinates({ lat, lon });
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const pt = new THREE.Vector3(e.point.x, e.point.y, e.point.z).normalize();
    const lat = Math.asin(pt.y) * (180 / Math.PI);
    const lon = Math.atan2(pt.x, pt.z) * (180 / Math.PI);
    setTargetCoordinates({ lat, lon });
  };

  const handlePointerOut = () => {
    setHoverCoordinates(null);
  };

  const radius = 8;
  const elevRad = (sunElevation * Math.PI) / 180;
  const aziRad = (sunAzimuth * Math.PI) / 180;
  
  const sunX = radius * Math.cos(elevRad) * Math.sin(aziRad);
  const sunY = radius * Math.sin(elevRad);
  const sunZ = radius * Math.cos(elevRad) * Math.cos(aziRad);

  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[sunX, sunY, sunZ]} intensity={2.5} castShadow />
      
      {/* Procedural Sprite Sun - completely realistic glow, no blocky geometry */}
      <sprite position={[sunX, sunY, sunZ]} scale={[6, 6, 6]}>
        <spriteMaterial map={sunTexture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={1} />
      </sprite>
      
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        {/* 256 is the perfect balance: smooth enough to not look blocky, low enough to not lag */}
        <sphereGeometry args={[2, 256, 256]} />
        <meshStandardMaterial 
          map={colorMap} 
          roughness={1.0}
          metalness={0.0}
        />
      </mesh>

      {/* Targeting Reticle */}
      {targetCoordinates && (
        <mesh 
          position={[
            2.02 * Math.cos(targetCoordinates.lat * Math.PI/180) * Math.sin(targetCoordinates.lon * Math.PI/180),
            2.02 * Math.sin(targetCoordinates.lat * Math.PI/180),
            2.02 * Math.cos(targetCoordinates.lat * Math.PI/180) * Math.cos(targetCoordinates.lon * Math.PI/180)
          ]}
        >
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0.9} />
        </mesh>
      )}
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={2.1}
        maxDistance={12}
      />
    </>
  );
}
